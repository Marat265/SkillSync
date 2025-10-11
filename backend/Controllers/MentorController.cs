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
    [Authorize(Roles = "Mentor")]
    public class MentorController : ControllerBase
    {
        private readonly ISessionService _sessionrep;
        private readonly IMentorService _mentorrep;
        private readonly ISkillService _skillrep;
        private readonly IMapper _mapper;

        public MentorController(
            ISessionService repository, IMentorService mentorRepository,
            ISkillService skillRepository, IMapper mapper)
        {
            _mapper = mapper;
            _sessionrep = repository;
            _mentorrep = mentorRepository;
            _skillrep = skillRepository;
        }


        [HttpGet("Skills")]
        public async Task<IActionResult> MentorSkills()
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(mentorId))
            {
                return Unauthorized("Mentor is not authenticated.");
            }

            var mentor = await _mentorrep.GetMentorWithSkillsByIdAsync(mentorId);

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

            var existingSkill = await _skillrep.FindSkillByNameAsync(skillName);

            if (existingSkill == null)
            {
                existingSkill = new Skills { Name = skillName };
                _skillrep.AddSkill(existingSkill);
                await _skillrep.SaveAsync();
            }
          

            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(mentorId))
            {
                return Unauthorized("Mentor is not authenticated.");
            }

            var existingMentorSkill =  await _skillrep.FindMentorSkillByIdAsync(mentorId, existingSkill.Id);   
            if (existingMentorSkill != null)
            {
                return BadRequest("You already have this skill.");
            }

            MentorSkills MentorSkill = new MentorSkills()
            {
                MentorId = mentorId,
                SkillId = existingSkill.Id
            };
            _skillrep.AddMentorSkill(MentorSkill);
            await _skillrep.SaveAsync();
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

            var skill = await _skillrep.FindSkillByNameAsync(skillName); 

            if (skill == null)
            {
                return BadRequest("Skill with the given name not found.");
            }
            

            var existingMentorSkill = await _skillrep.FindMentorSkillByIdAsync(mentorId, skill.Id);  


            if (existingMentorSkill == null)
            {
                return NotFound("Skill not found or not assigned to this mentor.");
            }

            _skillrep.RemoveMentorSkill(existingMentorSkill);
            await _skillrep.SaveAsync();
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
           

            var sessions = await _sessionrep.GetMentorSessionsByIdAsync(mentorId);

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

             _sessionrep.AddSession(session);
            await _sessionrep.SaveAsync();

            return Ok("Session created successfully");
        }


        [HttpDelete("Delete/{sessionId}")]
        public async Task<IActionResult> Delete(int sessionId)
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var session = await _sessionrep.GetMentorSessionByIdAsync(sessionId,mentorId);

            if (session == null)
            {
                return NotFound("Session not found");
            }

            _sessionrep.DeleteSession(session);
            await _sessionrep.SaveAsync();
            return Ok("Session deleted successfully");
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var mentorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _mentorrep.GetMentorByIdAsync(mentorId); 
            if (user == null)
            {
                return BadRequest("User not found");
            }

            var mentor = await _mentorrep.GetMentorProfileByIdAsync(mentorId);

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
            var mentor = await _mentorrep.GetMentorByIdAsync(mentorId);
            if (mentor == null)
            {
                return BadRequest("User not found");
            }

            if (model.Name == "string")
            {
                mentor.Email = model.Email;
                mentor.UserName = model.Email;
            }
            else if (model.Email == "string")
            {
                mentor.Name = model.Name;
            }
            else
            {
                mentor.Email = model.Email;
                mentor.UserName = model.Email;
                mentor.Name = model.Name;
            }

            var result = await _mentorrep.UpdateMentorProfileAsync(mentor); 

            if (result.Succeeded)
            {
                return Ok("Profile updated successfully");
            }
            return BadRequest(result.Errors);
        }





    }
}
