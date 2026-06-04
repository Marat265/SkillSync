using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Data;
using Skillsync.Dto;
using Skillsync.Dto.Chat;
using Skillsync.Models;

namespace Skillsync.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{chatRoom}")]
        public async Task<IActionResult> GetMessages(string chatRoom)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.ChatRoom == chatRoom)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }

        [HttpGet("conversations/{email}")]
        public async Task<IActionResult> GetConversations(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email is required.");

            var messages = await _context.ChatMessages
                .Where(m => m.FromEmail == email || m.ToEmail == email)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            var rawConversations = messages
                .GroupBy(m => m.ChatRoom)
                .Select(g =>
                {
                    var last = g.First();

                    return new
                    {
                        ChatRoom = g.Key,
                        PartnerEmail = last.FromEmail == email ? last.ToEmail : last.FromEmail,
                        LastMessage = last.Message,
                        LastMessageAt = last.SentAt,
                        LastSenderEmail = last.FromEmail
                    };
                })
                .OrderByDescending(c => c.LastMessageAt)
                .ToList();

            var partnerEmails = rawConversations
                .Select(c => c.PartnerEmail)
                .Where(partnerEmail => !string.IsNullOrWhiteSpace(partnerEmail))
                .Distinct()
                .ToList();

            var users = await _context.Users
                .Where(u => partnerEmails.Contains(u.Email))
                .ToDictionaryAsync(u => u.Email);

            var conversations = rawConversations
                .Select(c =>
                {
                    users.TryGetValue(c.PartnerEmail, out var partner);

                    return new ConversationDto
                    {
                        ChatRoom = c.ChatRoom,
                        PartnerEmail = c.PartnerEmail,
                        PartnerName = partner?.Name ?? c.PartnerEmail,
                        PartnerImage = partner?.Image ?? string.Empty,
                        LastMessage = c.LastMessage,
                        LastMessageAt = c.LastMessageAt,
                        LastSenderEmail = c.LastSenderEmail
                    };
                })
                .ToList();

            return Ok(conversations);
        }
    }
}
