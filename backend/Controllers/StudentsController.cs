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
        private readonly ISessionRepository _sessionrep;
        private readonly IStudentRepository _studentrep;
        private readonly IMapper _mapper;

        public StudentsController(ISessionRepository SessionRepository, IStudentRepository studentRepository, IMapper mapper)
        {
            _mapper = mapper;
            _sessionrep = SessionRepository;
            _studentrep = studentRepository;
        }


        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; 
            if (studentId == null)
            {
                return BadRequest("Student not found");
            }

            var student = await _studentrep.GetStudentByIdAsync(studentId); //*
            if (student == null)
            {
                return BadRequest("User not found");
            }

            // Получаем все регистрации для текущего студента
            var registrations = await _sessionrep.GetAllSessionRegistrationsWithMentorsAsync(studentId);



            // Извлекаем сессии, которые связаны с регистрациями
            var sessionDtos = registrations
                .Select(r => _mapper.Map<SessionDto>(r.Session)) // Преобразуем сессии в DTO
                .ToList();

            

            var profileDto = _mapper.Map<StudentProfileDto>(student);
            profileDto.Sessions = sessionDtos;

            return Ok(profileDto);
        }




        [HttpPatch("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var student = await _studentrep.GetStudentByIdAsync(studentId); 
            if (student == null)
            {
                return BadRequest("User not found");
            }

            if (model.Name == "string")
            {
                student.Email = model.Email;
                student.UserName = model.Email;
            }
            else if (model.Email == "string")
            {
                student.Name = model.Name;
            }
            else
            {
                student.Email = model.Email;
                student.UserName = model.Email;
                student.Name = model.Name;
            }

            var result = await _studentrep.UpdateStudentProfileAsync(student);

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

            var session = await _sessionrep.GetSessionWithRegistrationsByIdAsync(sessionId);

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

            _sessionrep.AddSessionRegistration(registration);
            session.CurrentStudents += 1; 
            await _sessionrep.SaveAsync();

            return Ok("Student successfully registered for the session");
        }

        [HttpDelete("Session/register/{sessionId}")]
        public async Task<IActionResult> LogOutOfSession(int sessionId)
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; 
            if (studentId == null)
            {
                return NotFound("Student not found");
            }

            var session = await _sessionrep.GetSessionWithRegistrationsByIdAsync(sessionId);

            if (session == null)
            {
                return NotFound("Session not found");
            }

            var registration =  await _sessionrep.GetSessionRegistrationAsync(studentId, sessionId);

            if (registration == null)
            {
                return NotFound("Registration not found for this student in the specified session.");
            }

            _sessionrep.DeleteSessionRegistration(registration);
            await _sessionrep.SaveAsync();

            return Ok("Student successfully logged out of the session");
        }


    }
}
