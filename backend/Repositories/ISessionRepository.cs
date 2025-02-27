using Portfolio.Dto;
using Portfolio.Models;

namespace Skillsync.Repositories
{
    public interface ISessionRepository
    {
        Task<Session> GetSessionWithMentorByIdAsync(int sessionId); //anonymus
        Task<List<Session>> GetAllSessionsWithMentorsAsync(); //anonymus
        Task<Session> GetSessionWithRegistrationsByIdAsync(int sessionId); //student RegisterForSession
        Task<SessionRegistration> GetSessionRegistrationAsync(string studentId, int sessionId); //student LogOutOfSession
        Task<List<SessionRegistration>> GetAllSessionRegistrationsWithMentorsAsync(string studentId); //student GetProfile
        Task<List<Session>> GetMentorSessionsByIdAsync(string mentorId); //mentor GetMentorSessions
        Task<Session> GetMentorSessionByIdAsync(int sessionId, string mentorId);
        Task AddSessionAsync(Session session); //mentor Create
        Task DeleteSessionAsync(Session session);
        Task AddSessionRegistrationAsync(SessionRegistration sessionRegistration);
        Task DeleteSessionRegistrationAsync(SessionRegistration sessionRegistration);
        Task SaveAsync();

    }
}
