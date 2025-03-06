using Microsoft.EntityFrameworkCore;
using Portfolio.Data;
using Portfolio.Models;
using Skillsync.Repositories;

namespace Skillsync.Services
{
    public class SkillRepository : ISkillRepository
    {
        private readonly ApplicationDbContext _context;
        public SkillRepository(ApplicationDbContext applicationDbContext)
        {
            _context = applicationDbContext;
        }

        public async Task<Skills> FindSkillByNameAsync(string skillName)
        {
            return await _context.Skills.FirstOrDefaultAsync(s => s.Name == skillName);
        }
        public async Task<MentorSkills> FindMentorSkillByIdAsync(string mentorID, int skillID)
        {
            return await _context.MentorSkills.FirstOrDefaultAsync(ms => ms.MentorId == mentorID
            && ms.SkillId == skillID);
        }
        public void AddMentorSkill(MentorSkills skill)
        {
            _context.MentorSkills.Add(skill);
        }
        public void RemoveMentorSkill(MentorSkills skill)
        {
            _context.MentorSkills.Remove(skill);
        }

        public void AddSkill(Skills skill)
        {
            _context.Skills.Add(skill);
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
