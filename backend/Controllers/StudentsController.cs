using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Writers;
using Portfolio.Data;
using Portfolio.Dto;
using Portfolio.Enum;
using Portfolio.Models;
using System.Security.Claims;

namespace Portfolio.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Student")]
    public class StudentsController : ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public StudentsController(UserManager<Users> userManager,
            ApplicationDbContext context, IMapper mapper)
        {
            _userManager = userManager;
            _context = context;
            _mapper = mapper;
        }


        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (studentId == null)
            {
                return BadRequest("Student not found");
            }

            var user = await _userManager.FindByIdAsync(studentId);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            // Получаем все регистрации для текущего студента
            var registrations = await _context.SessionRegistrations
                .Where(r => r.StudentId == studentId)
                .Include(r => r.Session) // Включаем сессии для этих регистраций
                .ThenInclude(s => s.Mentor)
                .ToListAsync();

            if (!registrations.Any())
            {
                return NotFound("No sessions found for this student");
            }

            // Извлекаем сессии, которые связаны с регистрациями
            var sessionDtos = registrations
                .Select(r => _mapper.Map<SessionDto>(r.Session)) // Преобразуем сессии в DTO
                .ToList();

            // Получаем студента и маппим на профиль
            var student = await _context.Users
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student == null)
            {
                return NotFound("Student not found");
            }

            var profileDto = _mapper.Map<StudentProfileDto>(student);
            profileDto.Sessions = sessionDtos;

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

        [HttpPost("Session/register/{sessionId}")]
        public async Task<IActionResult> RegisterForSession(int sessionId)
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (studentId == null)
            {
                return NotFound("Student not found");
            }

            var session = await _context.Sessions
                .Include(s => s.Registrations)  
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);

            if (session == null)
            {
                return NotFound("Session not found");
            }

            if (session.CurrentStudents >= session.MaxStudents)
            {
                return BadRequest("Session is full");
            }

            if (session.Registrations.Any(r => r.StudentId == studentId))
            {
                return BadRequest("Student is already registered for this session");
            }

            var registration = new SessionRegistration
            {
                SessionId = sessionId,
                StudentId = studentId,
                Status = SessionStatus.Completed 
            };

            _context.SessionRegistrations.Add(registration);
            session.CurrentStudents += 1; 
            await _context.SaveChangesAsync();

            return Ok("Student successfully registered for the session");
        }


    }
}
