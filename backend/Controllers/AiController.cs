using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Data;
using Portfolio.Enum;
using Portfolio.Models;
using Skillsync.Dto.Ai;
using Skillsync.Services;
using System.Security.Claims;

namespace Skillsync.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<Users> _userManager;
        private readonly GeminiService _geminiService;

        public AiController(ApplicationDbContext context, UserManager<Users> userManager, GeminiService geminiService)
        {
            _context = context;
            _userManager = userManager;
            _geminiService = geminiService;
        }

        [HttpPost("student-assistant")]
        public async Task<IActionResult> StudentAssistant([FromBody] AiPromptRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message is required.");
            }

            var upcomingSessions = await _context.Sessions
                .Include(s => s.Mentor)
                .Where(s => s.Status == SessionStatus.Scheduled && s.StartTime >= DateTime.UtcNow)
                .OrderBy(s => s.StartTime)
                .Take(8)
                .Select(s => new
                {
                    s.Topic,
                    Mentor = s.Mentor.Name,
                    s.StartTime,
                    Seats = $"{s.CurrentStudents}/{s.MaxStudents}"
                })
                .ToListAsync();

            var popularTopics = await _context.Sessions
                .GroupBy(s => s.Topic)
                .OrderByDescending(g => g.Count())
                .Take(6)
                .Select(g => new { Topic = g.Key, Count = g.Count() })
                .ToListAsync();

            var input =
                $"Student question: {request.Message}\n\n" +
                $"Upcoming sessions: {System.Text.Json.JsonSerializer.Serialize(upcomingSessions)}\n" +
                $"Popular topics: {System.Text.Json.JsonSerializer.Serialize(popularTopics)}";

            var answer = await _geminiService.GenerateAsync(
                "You are SkillSync AI Learning Assistant. Give practical, structured, student-friendly programming guidance. Recommend relevant session topics when useful. Keep the answer clear and actionable.",
                input);

            return Ok(new AiPromptResponse { Answer = answer });
        }

        [HttpGet("mentor-analytics")]
        [Authorize(Roles = "Mentor")]
        public async Task<IActionResult> MentorAnalytics()
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(mentorId))
            {
                return Unauthorized();
            }

            var sessions = await _context.Sessions
                .Where(s => s.MentorId == mentorId)
                .OrderByDescending(s => s.StartTime)
                .ToListAsync();

            var analytics = new MentorAnalyticsDto
            {
                TotalSessions = sessions.Count,
                ScheduledSessions = sessions.Count(s => s.Status == SessionStatus.Scheduled),
                CompletedSessions = sessions.Count(s => s.Status == SessionStatus.Completed),
                TotalStudents = sessions.Sum(s => s.CurrentStudents),
                AverageFillRate = sessions.Count == 0
                    ? 0
                    : Math.Round(sessions.Average(s => s.MaxStudents == 0 ? 0 : (double)s.CurrentStudents / s.MaxStudents) * 100, 1),
                TopTopics = sessions
                    .GroupBy(s => s.Topic)
                    .OrderByDescending(g => g.Count())
                    .Take(5)
                    .Select(g => new TopicStatDto { Topic = g.Key, Count = g.Count() })
                    .ToList()
            };

            var input = System.Text.Json.JsonSerializer.Serialize(analytics);
            analytics.AiSummary = await _geminiService.GenerateAsync(
                "You are an analytics assistant for programming mentors. Explain what the metrics mean and give 3 concrete improvements for future sessions.",
                input);

            return Ok(analytics);
        }

        [HttpGet("mentor-matches")]
        public async Task<IActionResult> MentorMatches([FromQuery] string goal, [FromQuery] int limit = 5)
        {
            if (string.IsNullOrWhiteSpace(goal))
            {
                return BadRequest("Goal is required.");
            }

            limit = Math.Clamp(limit, 1, 10);
            var goalWords = goal
                .ToLowerInvariant()
                .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(w => w.Length > 2)
                .Distinct()
                .ToList();

            var mentors = await _userManager.GetUsersInRoleAsync("Mentor");
            var mentorIds = mentors.Select(m => m.Id).ToList();

            var sessionsByMentor = await _context.Sessions
                .Where(s => mentorIds.Contains(s.MentorId))
                .GroupBy(s => s.MentorId)
                .ToDictionaryAsync(g => g.Key, g => g.ToList());

            var skillsByMentor = await _context.MentorSkills
                .Include(ms => ms.Skill)
                .Where(ms => mentorIds.Contains(ms.MentorId))
                .GroupBy(ms => ms.MentorId)
                .ToDictionaryAsync(g => g.Key, g => g.Select(ms => ms.Skill.Name).ToList());

            var matches = mentors
                .Select(mentor =>
                {
                    sessionsByMentor.TryGetValue(mentor.Id, out var mentorSessions);
                    skillsByMentor.TryGetValue(mentor.Id, out var mentorSkills);

                    mentorSessions ??= new List<Session>();
                    mentorSkills ??= new List<string>();

                    var searchable = string.Join(" ", mentor.Name, mentor.Email, string.Join(" ", mentorSkills), string.Join(" ", mentorSessions.Select(s => s.Topic))).ToLowerInvariant();
                    var keywordHits = goalWords.Count(word => searchable.Contains(word));
                    var activeSessions = mentorSessions.Count(s => s.Status == SessionStatus.Scheduled && s.StartTime >= DateTime.UtcNow);
                    var completedSessions = mentorSessions.Count(s => s.Status == SessionStatus.Completed);
                    var fillRateBonus = mentorSessions.Count == 0
                        ? 0
                        : mentorSessions.Average(s => s.MaxStudents == 0 ? 0 : (double)s.CurrentStudents / s.MaxStudents) * 12;

                    var score = Math.Min(100, (keywordHits * 26) + (activeSessions * 8) + (completedSessions * 5) + (int)Math.Round(fillRateBonus));

                    return new MentorMatchDto
                    {
                        MentorId = mentor.Id,
                        Name = mentor.Name,
                        Email = mentor.Email,
                        Image = mentor.Image,
                        Score = score,
                        Skills = mentorSkills,
                        UpcomingSessions = mentorSessions
                            .Where(s => s.Status == SessionStatus.Scheduled && s.StartTime >= DateTime.UtcNow)
                            .OrderBy(s => s.StartTime)
                            .Take(3)
                            .Select(s => s.Topic)
                            .ToList(),
                        Reason = keywordHits > 0
                            ? "Matches your goal through skills or session topics."
                            : "Suggested because this mentor is active on SkillSync."
                    };
                })
                .Where(m => m.Score > 0)
                .OrderByDescending(m => m.Score)
                .ThenBy(m => m.Name)
                .Take(limit)
                .ToList();

            var response = new MentorMatchResponse
            {
                Goal = goal,
                Matches = matches
            };

            response.AiAdvice = await _geminiService.GenerateAsync(
                "You help students pick the right programming mentor. Explain the top matches briefly and suggest what to ask the mentor first.",
                System.Text.Json.JsonSerializer.Serialize(response));

            return Ok(response);
        }
    }
}
