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
using Skillsync.Repositories;
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
        private readonly ISessionRepository _repository;
        private readonly IMapper _mapper;

        public StudentsController(UserManager<Users> userManager,
            ApplicationDbContext context, ISessionRepository repository, IMapper mapper)
        {
            _userManager = userManager;
            _context = context;
            _mapper = mapper;
            _repository = repository;

        }


        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; 
            if (studentId == null)
            {
                return BadRequest("Student not found");
            }

            var user = await _userManager.FindByIdAsync(studentId); //*
            if (user == null)
            {
                return BadRequest("User not found");
            }

            // Получаем все регистрации для текущего студента
            var registrations = await _repository.GetAllSessionRegistrationsWithMentorsAsync(studentId);



            // Извлекаем сессии, которые связаны с регистрациями
            var sessionDtos = registrations
                .Select(r => _mapper.Map<SessionDto>(r.Session)) // Преобразуем сессии в DTO
                .ToList();

            // Получаем студента и маппим на профиль
            var student = await _context.Users
                .FirstOrDefaultAsync(s => s.Id == studentId); //*

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
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; //*
            var user = await _userManager.FindByIdAsync(studentId); //*
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

            var result = await _userManager.UpdateAsync(user); //*

            if (result.Succeeded)
            {
                return Ok("Profile updated successfully");
            }
            return BadRequest(result.Errors);
        }

        [HttpPost("Session/register/{sessionId}")]
        public async Task<IActionResult> RegisterForSession(int sessionId)
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; //*
            if (studentId == null)
            {
                return NotFound("Student not found");
            }

            var session = await _repository.GetSessionWithRegistrationsByIdAsync(sessionId);

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

            _repository.AddSessionRegistration(registration);
            session.CurrentStudents += 1; 
            await _repository.SaveAsync();

            return Ok("Student successfully registered for the session");
        }

        [HttpDelete("Session/register/{sessionId}")]
        public async Task<IActionResult> LogOutOfSession(int sessionId)
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; //*
            if (studentId == null)
            {
                return NotFound("Student not found");
            }

            var session = await _repository.GetSessionWithRegistrationsByIdAsync(sessionId);

            if (session == null)
            {
                return NotFound("Session not found");
            }

            var registration =  await _repository.GetSessionRegistrationAsync(studentId, sessionId);

            if (registration == null)
            {
                return NotFound("Registration not found for this student in the specified session.");
            }

            _repository.DeleteSessionRegistration(registration);
            await _repository.SaveAsync();

            return Ok("Student successfully logged out of the session");
        }


    }
}
