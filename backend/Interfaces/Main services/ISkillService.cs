using Portfolio.Models;

namespace Skillsync.Repositories
{
    public interface ISkillService
    {
        Task<Skills> FindSkillByNameAsync(string skillName);
        Task<MentorSkills> FindMentorSkillByIdAsync(string mentorID, int skillID);
        void AddMentorSkill(MentorSkills skill);
        void RemoveMentorSkill(MentorSkills skill);
        void AddSkill(Skills skill);
        Task SaveAsync();
    }
}
