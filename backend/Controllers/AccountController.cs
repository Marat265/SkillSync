using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Dto.Auth;
using Portfolio.Interfaces.Auth;
using Portfolio.Models;
using Skillsync.Dto;
using Skillsync.Interfaces.Image;
using System.Security.Claims;

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

            _jwtProvider.AppendAuthCookie(Response, token);

            var role = await _userManager.GetRolesAsync(user);

            return Ok(new {role, userName = user.Name});
        }

        [HttpGet("google-login")]
        public IActionResult GoogleLogin([FromQuery] string returnUrl = "/")
        {
            var redirectUrl = Url.Action("GoogleResponse", "Account", new { returnUrl }, Request.Scheme);

            var properties = _signInManager.ConfigureExternalAuthenticationProperties(
                provider: "Google",
                redirectUrl: redirectUrl
            );

            return Challenge(properties, "Google");
        }


        [HttpGet("google-response")]
        public async Task<IActionResult> GoogleResponse([FromQuery] string returnUrl = "/")
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();

            if (info == null)
                return Unauthorized("Google login failed");

            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            var name = info.Principal.FindFirstValue(ClaimTypes.Name);

            var pictureUrl = info.Principal.FindFirstValue("picture");

            if (string.IsNullOrEmpty(pictureUrl))
            {
                pictureUrl = "https://secure.gravatar.com/avatar/8de7fccc13e6e1db84cb8d76ef9141c7?s=500&d=mm&r=g"; 
            }


            var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);

            if (user == null)
            {
                user = await _userManager.FindByNameAsync(email);

                if (user == null)
                {
                    user = new Users
                    {
                        Email = email,
                        UserName = email,
                        Name = name,
                        Image = pictureUrl
                    };

                    var result = await _userManager.CreateAsync(user);
                }

                var addLoginResult = await _userManager.AddLoginAsync(user, info);
                
            }
            await _signInManager.SignInAsync(user, isPersistent: false);

            var token = await _jwtProvider.GenerateToken(user);
            _jwtProvider.AppendAuthCookie(Response, token);

            var role = await _userManager.GetRolesAsync(user);

            var roleParam = (role == null || !role.Any()) ? null : role.First();

            return Redirect($"{returnUrl}?email={user.Email}&userName={user.Name}&role={roleParam}");
        }

        [HttpPost("set-role")]
        public async Task<IActionResult> SetRole([FromBody] SetRoleModelDto model)
        {
            var user = await _userManager.FindByNameAsync(model.Email);
            if (user == null)
                return NotFound("User not found");

            var currentRoles = await _userManager.GetRolesAsync(user);

            if (currentRoles.Any())
            {
                return Ok("Role already exists");
            }

            if (!await _roleManager.RoleExistsAsync(model.Role))
            {
                return BadRequest("Role does not exist");
            }

            var result = await _userManager.AddToRoleAsync(user, model.Role);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("Role set successfully");
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
