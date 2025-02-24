using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Writers;
using Portfolio.Data;
using Portfolio.Dto;
using Portfolio.Models;
using System.Security.Claims;

namespace Portfolio.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Mentor")]
    public class MentorController : ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public MentorController(UserManager<Users> userManager, 
            ApplicationDbContext context, IMapper mapper)
        {
            _userManager = userManager;
            _context = context;
            _mapper = mapper;
        }


        [HttpGet("Skills")]
        public async Task<IActionResult> MentorSkills()
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(mentorId))
            {
                return Unauthorized("Mentor is not authenticated.");
            }

            var mentor = await _context.Users.Include(u => u.MentorSkills)
                .ThenInclude(ms => ms.Skill)
                .FirstOrDefaultAsync(u => u.Id == mentorId);

            if (mentor == null)
            {
                return NotFound("Mentor not found");
            }

            var skillNames = mentor.MentorSkills.Select(ms => ms.Skill.Name).ToList();
            if (!skillNames.Any())
            {
                return NotFound("You dont have skills");
            }

            return Ok(skillNames);
        }


        [HttpPost("Skills/{skillName}")]
        public async Task<IActionResult> CreateSkills(string skillName)
        {
            if (string.IsNullOrEmpty(skillName))
            {
                return BadRequest("Enter your skill");
            }

            var existingSkill = await _context.Skills.FirstOrDefaultAsync(s => s.Name == skillName);

            if (existingSkill == null)
            {
                existingSkill = new Skills { Name = skillName };
                _context.Skills.Add(existingSkill);
                await _context.SaveChangesAsync();
            }
          

            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(mentorId))
            {
                return Unauthorized("Mentor is not authenticated.");
            }

            var existingMentorSkill = await _context.MentorSkills.FirstOrDefaultAsync(ms => ms.MentorId == mentorId 
            && ms.SkillId == existingSkill.Id);
            if (existingMentorSkill != null)
            {
                return BadRequest("You already have this skill.");
            }

            MentorSkills MentorSkills = new MentorSkills()
            {
                MentorId = mentorId,
                SkillId = existingSkill.Id
            };
            _context.MentorSkills.Add(MentorSkills);
            await _context.SaveChangesAsync();

            return Ok("Skill added successfully.");
        }
        
        
        [HttpDelete("Skills/{skillName}")]
        public async Task<IActionResult> DeleteSkill(string skillName)
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(mentorId))
            {
                return Unauthorized("Mentor is not authenticated.");
            }

            var skill = await _context.Skills.FirstOrDefaultAsync(s => s.Name == skillName);

            if (skill == null)
            {
                return BadRequest("Skill with the given name not found.");
            }
            

            var existingMentorSkill = await _context.MentorSkills
                .FirstOrDefaultAsync(ms => ms.MentorId == mentorId && ms.SkillId == skill.Id);


            if (existingMentorSkill == null)
            {
                return NotFound("Skill not found or not assigned to this mentor.");
            }

            _context.MentorSkills.Remove(existingMentorSkill);
            await _context.SaveChangesAsync();
            return Ok("Skill removed successfully.");

        }





        [HttpGet("Session")]
        public async Task<IActionResult> GetMentorSessions()
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(mentorId))
            {
                return Unauthorized("Mentor is not authenticated.");
            }
           

            var sessions = await _context.Sessions
                .Where(s => s.MentorId == mentorId)
                .Include(m => m.Mentor)
                .ToListAsync();

            if (!sessions.Any())
            {
                return NoContent();
            }

           var sessionDtos = _mapper.Map<List<SessionDto>>(sessions);

            return Ok(sessionDtos);
        }


        [HttpPost("Create/Session")]
        public async Task<IActionResult> Create([FromBody] CreateSessionModel model)
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(mentorId))
            {
                return Unauthorized("Mentor is not authenticated.");
            }

            if (model.MaxStudents <= 0)
            {
                return BadRequest("MaxStudents must be greater than zero.");
            }


            var session = new Session
            {
                MentorId = mentorId,
                Topic = model.Topic,
                StartTime = model.StartTime,
                Duration = model.Duration,
                MaxStudents = model.MaxStudents,
                Status = Enum.SessionStatus.Scheduled
            };

             _context.Add(session);
            await _context.SaveChangesAsync();

            return Ok("Session created successfully");
        }


        [HttpDelete("Delete/{sessionId}")]
        public async Task<IActionResult> Delete(int sessionId)
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var session = await _context.Sessions.FirstOrDefaultAsync(s => s.SessionId == sessionId
            && s.MentorId == mentorId);

            if (session == null)
            {
                return NotFound("Session not found");
            }

            _context.Remove(session);
            await _context.SaveChangesAsync();
            return Ok("Session deleted successfully");
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userManager.FindByIdAsync(mentorId);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            var mentor = await _context.Users.Where(m => m.Id == mentorId)
                .Include(m => m.MentorSkills)
                .ThenInclude(m => m.Skill)
                .Include(m => m.Reviews)
                .FirstOrDefaultAsync();

            if (mentor == null)
            {
                return NotFound("Mentor not found");
            }


            var profileDto = _mapper.Map<MentorProfileDto>(mentor);

            return Ok(profileDto);  
        }


        [HttpPatch("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userManager.FindByIdAsync(mentorId);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            if (model.Name == "string")
            {
                user.Email = model.Email;
                user.UserName = model.Email;
            }
            else if (model.Email == "string")
            {
                user.Name = model.Name;
            }
            else
            {
                user.Email = model.Email;
                user.UserName = model.Email;
                user.Name = model.Name;
            }

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok("Profile updated successfully");
            }
            return BadRequest(result.Errors);
        }





    }
}
