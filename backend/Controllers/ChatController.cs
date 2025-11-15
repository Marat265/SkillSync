using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Data;
using Skillsync.Dto;
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

    }
}
