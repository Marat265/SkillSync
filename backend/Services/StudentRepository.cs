using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Portfolio.Data;
using Portfolio.Models;
using Skillsync.Repositories;
using System.Security.Claims;

namespace Skillsync.Services
{
    public class StudentRepository : IStudentRepository
    {
        private readonly UserManager<Users> _userManager;
        private readonly ApplicationDbContext _context;

        public StudentRepository(UserManager<Users> userManager,ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }
        public async Task<List<Users>> GetStudentsAsync()
        {
            var student = await _userManager.GetUsersInRoleAsync("Student");
            return student.ToList();
        }

        public async Task<Users> GetStudentByIdAsync(string id)
        {
            return await _context.Users.FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IdentityResult> UpdateStudentAsync(Users student)
        {
            return await _userManager.UpdateAsync(student);
        }
    }
}
