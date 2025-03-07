using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Dto.Auth;
using Portfolio.Interfaces.Auth;
using Portfolio.Models;
using Skillsync.Interfaces;

namespace Portfolio.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly SignInManager<Users> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IPhotoService _photoService;
        private readonly IJwtProvider _jwtProvider;

        public AccountController(UserManager<Users> userManager, SignInManager<Users> signInManager,
            RoleManager<IdentityRole> roleManager, IPhotoService photoService, IJwtProvider provider)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _jwtProvider = provider;
            _photoService = photoService;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromForm] RegisterModel model)
        {
            if (!await _roleManager.RoleExistsAsync(model.Role))
            {
                return BadRequest("Wrong option, try again!");
            }

            var photoResult = await _photoService.AddPhotoAsync(model.Image);
                var user = new Users
                {
                    Name = model.Name,
                    UserName = model.Email,
                    Email = model.Email,
                    Image = photoResult.Url.ToString()
                };

                var result = await _userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {
                       await _userManager.AddToRoleAsync(user, model.Role);
                }
                else return BadRequest(result.Errors);
            

            return Ok("Registered successfully");
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginModel model)
        {

            var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, false, false);

            if (!result.Succeeded)
            {
                return Unauthorized("Invalid email or password");
            }
            var user = await _userManager.FindByNameAsync(model.Email);
            var token = await _jwtProvider.GenerateToken(user);

            Response.Cookies.Append("token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                Expires = DateTime.UtcNow.AddMinutes(30) 
            });

            var role = await _userManager.GetRolesAsync(user);

            return Ok(new {role});
        }


        [HttpPost("LogOut")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            Response.Cookies.Delete("token");
            return Ok();
        }
    }
}
