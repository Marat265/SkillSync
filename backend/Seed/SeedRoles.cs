using Microsoft.AspNetCore.Identity;
using Portfolio.Models;

namespace Portfolio.Seed
{
    public static class SeedRoles
    {
        public static async Task SeedAsync( 
            RoleManager<IdentityRole> roleManager,
            UserManager<Users> userManager)
        {
            var roles = new List<string> { "Admin", "Mentor", "Student" };

            foreach (var role in roles)
            {
                var roleExist = await roleManager.RoleExistsAsync(role);
                if (!roleExist)
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }


            var adminUser = await userManager.FindByEmailAsync("admin@example.com");
            if (adminUser == null)
            {
                adminUser = new Users
                {
                    UserName = "admin@example.com",
                    Email = "admin@example.com",
                    Name = "Admin User"
                };
                await userManager.CreateAsync(adminUser, "AdminPassword123!");
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
}
