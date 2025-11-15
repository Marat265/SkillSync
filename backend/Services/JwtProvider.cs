using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Interfaces.Auth;
using Portfolio.Models;
using Portfolio.Token;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Skillsync.Services
{
    public class JwtProvider : IJwtProvider
    {
        private readonly JwtOptions _options;
        private readonly UserManager<Users> _userManager;


        public JwtProvider(IOptions<JwtOptions> options, UserManager<Users> userManager)
        {
            _options = options.Value;
            _userManager = userManager;
        }
        public async Task<string> GenerateToken(Users user)
        {
            var person = await _userManager.FindByNameAsync(user.Email);
            var roles = await _userManager.GetRolesAsync(person);

            var claim = new List<Claim> {
             new Claim(ClaimTypes.Name, user.Name),
             new Claim(ClaimTypes.Email, user.Email)
            };

            foreach (var role in roles)
            {
                claim.Add(new Claim(ClaimTypes.Role, role));
            }

            var signingCredentails = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SecretKey)),
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claim,
                signingCredentials: signingCredentails,
                expires: DateTime.UtcNow.AddHours(_options.ExpiresHour)
                );

            var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);
            return tokenValue;

        }

        public void AppendAuthCookie(HttpResponse response, string token)
        {
            response.Cookies.Append("token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                //suspecious
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(30)
            });
        }

    }
}
