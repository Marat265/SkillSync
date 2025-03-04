using Microsoft.AspNetCore.Identity;
using Portfolio.Models;

namespace Skillsync.Repositories
{
    public interface IMentorRepository
    {
        Task<List<Users>> GetAllMentorsAsync(); //anonymus GetMentors
        Task<Users> GetMentorByIdAsync(string id);  //anonymus GetMentor
        Task<Users> GetMentorWithSkillsById(string id); //mentor MentorSkills
        Task<Users> GetMentorProfileByIdAsync(string id);  //mentor GetProfile
        Task<IdentityResult> UpdateStudentAsync(Users users);

    }
}
