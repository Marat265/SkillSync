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
using Skillsync.Repositories;
using System.Security.Claims;

namespace Portfolio.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class AnonymousController : ControllerBase
    {
        private readonly ISessionRepository _sessionrep;
        private readonly IStudentRepository _studentrep;
        private readonly IMentorRepository _mentorrep;
        private readonly IMapper _mapper;

        public AnonymousController(IMapper mapper, ISessionRepository SessionRepository, 
            IStudentRepository studentRepository,
             IMentorRepository mentorRepository) 
        {
            _mapper = mapper;
            _sessionrep = SessionRepository;
            _studentrep = studentRepository;
            _mentorrep = mentorRepository;
        }

        
        [HttpGet("Session/{sessionId}")]
        public async Task<IActionResult> GetSession(int sessionId)
        {
            var session = await _sessionrep.GetSessionWithMentorByIdAsync(sessionId);
                
            if (session == null)
            {
                return NotFound("Session not found");
            }

            var sessionDtos = _mapper.Map<SessionDto>(session);

            return Ok(sessionDtos);
        }


        [HttpGet("Sessions")]
        public async Task<IActionResult> GetSessions()
        {
            var sessions = await _sessionrep.GetAllSessionsWithMentorsAsync();

            if (!sessions.Any())
            {
                return NotFound("There is no Sessions");
            }
            var sessionDtos = _mapper.Map<List<SessionDto>>(sessions);

            return Ok(sessionDtos);
        }


        [HttpGet("Students")]
        public async Task<IActionResult> GetStudents()
        {
            var students = await _studentrep.GetStudentsAsync();
            if (!students.Any())
            {
                return BadRequest("There is no students");
            }

            var studentDtos = _mapper.Map<List<UserDto>>(students);

            return Ok(studentDtos);
        }

        [HttpGet("Student/{studentId}")]
        public async Task<IActionResult> GetStudents(string studentId)
        {
            var student = await _studentrep.GetStudentByIdAsync(studentId);
            if (student == null)
            {
                return BadRequest("Student not found");
            }
            var studentDto = _mapper.Map<UserDto>(student);

            return Ok(studentDto);
        }

        [HttpGet("Mentors")]
        public async Task<IActionResult> GetMentors()
        {
            var mentors = await _mentorrep.GetAllMentorsAsync(); //*
            if (!mentors.Any())
            {
                return BadRequest("There is no mentors");
            }

            var mentorsDtos = _mapper.Map<List<UserDto>>(mentors);

            return Ok(mentorsDtos);
        }

        [HttpGet("Mentors/{mentorId}")]
        public async Task<IActionResult> GetMentor(string mentorId)
        {
            var mentor = await _mentorrep.GetMentorByIdAsync(mentorId); //*
            if (mentor == null)
            {
                return BadRequest("Student not found");
            }
            var mentorDto = _mapper.Map<UserDto>(mentor);

            return Ok(mentorDto);
        }


    }
}
