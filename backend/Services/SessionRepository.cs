using Portfolio.Models;
using Skillsync.Repositories;

namespace Skillsync.Services
{
    public class SessionRepository : ISessionRepository
    {
        public Task AddSessionAsync(Session session)
        {
            throw new NotImplementedException();
        }

        public Task AddSessionRegistrationAsync(SessionRegistration sessionRegistration)
        {
            throw new NotImplementedException();
        }

        public Task DeleteSessionAsync(Session session)
        {
            throw new NotImplementedException();
        }

        public Task DeleteSessionRegistrationAsync(SessionRegistration sessionRegistration)
        {
            throw new NotImplementedException();
        }

        public Task<List<SessionRegistration>> GetAllSessionRegistrationsWithMentorsAsync(string studentId)
        {
            throw new NotImplementedException();
        }

        public Task<List<Session>> GetAllSessionsWithMentorsAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Session> GetMentorSessionByIdAsync(int sessionId, string mentorId)
        {
            throw new NotImplementedException();
        }

        public Task<List<Session>> GetMentorSessionsByIdAsync(string mentorId)
        {
            throw new NotImplementedException();
        }

        public Task<SessionRegistration> GetSessionRegistrationAsync(string studentId, int sessionId)
        {
            throw new NotImplementedException();
        }

        public Task<Session> GetSessionWithMentorByIdAsync(int sessionId)
        {
            throw new NotImplementedException();
        }

        public Task<Session> GetSessionWithRegistrationsByIdAsync(int sessionId)
        {
            throw new NotImplementedException();
        }

        public Task SaveAsync()
        {
            throw new NotImplementedException();
        }
    }
}
