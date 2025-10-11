using Portfolio.Dto;
using Portfolio.Models;

namespace Skillsync.Repositories
{
    public interface ISessionService
    {
        Task<Session> GetSessionWithMentorByIdAsync(int sessionId); //anonymus
        Task<List<Session>> GetAllSessionsWithMentorsAsync(); //anonymus
        Task<Session> GetSessionWithRegistrationsByIdAsync(int sessionId); //student RegisterForSession
        Task<SessionRegistration> GetSessionRegistrationAsync(string studentId, int sessionId); //student LogOutOfSession
        Task<List<SessionRegistration>> GetAllSessionRegistrationsWithMentorsAsync(string studentId); //student GetProfile
        Task<List<Session>> GetMentorSessionsByIdAsync(string mentorId); //mentor GetMentorSessions
        Task<Session> GetMentorSessionByIdAsync(int sessionId, string mentorId);
        void AddSession(Session session); //mentor Create
        void DeleteSession(Session session);
        void AddSessionRegistration(SessionRegistration sessionRegistration);
        void DeleteSessionRegistration(SessionRegistration sessionRegistration);
        Task SaveAsync();

    }
}
