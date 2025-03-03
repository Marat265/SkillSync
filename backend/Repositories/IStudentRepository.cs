using Microsoft.AspNetCore.Identity;
using Portfolio.Models;

namespace Skillsync.Repositories
{
    public interface IStudentRepository
    {
        Task<List<Users>> GetStudentsAsync();  //anonymus GetStudents
        Task<Users> GetStudentByIdAsync(string id); //anonymus GetStudents
        Task<IdentityResult> UpdateStudentAsync(Users student); //student UpdateProfile
    }
}
