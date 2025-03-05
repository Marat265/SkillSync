using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Portfolio.Data;
using Portfolio.Models;
using Skillsync.Repositories;

namespace Skillsync.Services
{
    public class MentorRespository : IMentorRepository
    {
        private readonly UserManager<Users> _userManager;
        private readonly ApplicationDbContext _context;

        public MentorRespository(UserManager<Users> userManager, ApplicationDbContext applicationDbContext)
        {
            _userManager = userManager;
            _context = applicationDbContext;
        }

        public async Task<List<Users>> GetAllMentorsAsync()
        {
           var mentors = await _userManager.GetUsersInRoleAsync("Mentor");
            return mentors.ToList();
        }

        public async Task<Users> GetMentorByIdAsync(string id)
        {
            return await _context.Users.FirstOrDefaultAsync(m => m.Id == id);
        }
        public async Task<Users> GetMentorWithSkillsByIdAsync(string id)
        {
            var mentor = await _context.Users.Include(u => u.MentorSkills) //*
                .ThenInclude(ms => ms.Skill)
                .FirstOrDefaultAsync(u => u.Id == id);
            return mentor;
        }

        public async Task<Users> GetMentorProfileByIdAsync(string id)
        {
            var mentor = await _context.Users.Where(m => m.Id == id) 
                .Include(m => m.MentorSkills)
                .ThenInclude(m => m.Skill)
                .Include(m => m.Reviews)
                .FirstOrDefaultAsync();
            return mentor;
        }


        public async Task<IdentityResult> UpdateMentorProfileAsync(Users mentor)
        {
            return await _userManager.UpdateAsync(mentor);
        }
    }
}
