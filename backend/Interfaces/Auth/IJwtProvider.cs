using Portfolio.Models;

namespace Portfolio.Interfaces.Auth
{
    public interface IJwtProvider
    {
        Task<string> GenerateToken(Users user);
        void AppendAuthCookie(HttpResponse response, string token);

    }
}
