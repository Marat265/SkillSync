using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Portfolio.Data;
using Portfolio.Models;
using Skillsync.Repositories;

namespace Skillsync.Services
{
    public class SessionRepository : ISessionRepository
    {
        private readonly ApplicationDbContext _context;

        public SessionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Session> GetSessionWithMentorByIdAsync(int sessionId)
        {

            return await _context.Sessions
               .Include(m => m.Mentor)
               .FirstOrDefaultAsync(s => s.SessionId == sessionId);
        }

        public async Task<List<Session>> GetAllSessionsWithMentorsAsync()
        {
            return await _context.Sessions
            .Include(m => m.Mentor)
              .ToListAsync();
        }

        public async Task<Session> GetSessionWithRegistrationsByIdAsync(int sessionId)
        {
            return await _context.Sessions
                .Include(s => s.Registrations)
                .FirstOrDefaultAsync(s => s.SessionId == sessionId);
        }
        public async Task<SessionRegistration> GetSessionRegistrationAsync(string studentId, int sessionId)
        {
            return await _context.SessionRegistrations.FirstOrDefaultAsync(r => r.StudentId == studentId
               && sessionId == r.SessionId);
        }
        public async Task<List<SessionRegistration>> GetAllSessionRegistrationsWithMentorsAsync(string studentId)
        {
            return await _context.SessionRegistrations
                .Where(r => r.StudentId == studentId)
                .Include(r => r.Session) // Включаем сессии для этих регистраций
                .ThenInclude(s => s.Mentor)
                .ToListAsync();
        }

        public async Task<List<Session>> GetMentorSessionsByIdAsync(string mentorId)
        {
           return await _context.Sessions
                .Where(s => s.MentorId == mentorId)
                .Include(m => m.Mentor)
                .ToListAsync();
        }
        public async Task<Session> GetMentorSessionByIdAsync(int sessionId, string mentorId)
        {
            return await _context.Sessions.FirstOrDefaultAsync(s => s.SessionId == sessionId
            && s.MentorId == mentorId);
        }


        public void AddSession(Session session)
        {
            _context.Add(session);
        }
        public void DeleteSession(Session session)
        {
            _context.Remove(session);
        }


        public void AddSessionRegistration(SessionRegistration sessionRegistration)
        {
            _context.SessionRegistrations.Add(sessionRegistration);
        }

        public void DeleteSessionRegistration(SessionRegistration sessionRegistration)
        {
            _context.SessionRegistrations.Remove(sessionRegistration);
        }

        public async Task SaveAsync()
        {
           await _context.SaveChangesAsync();
        }
    }
}
