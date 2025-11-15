using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Portfolio.Data;
using Portfolio.Models;
using Skillsync.Models;
using System.Text.Json;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Skillsync.Hubs
{
    public interface IChatClient
    {
        public Task ReceiveMessage(string userName, string message);
        Task UserStatusChanged(string email, bool isOnline);
    }

    public class ChatHub: Hub<IChatClient>
    {
        private readonly IMemoryCache _cache;
        private readonly ApplicationDbContext _context;
        private static readonly Dictionary<string, string> OnlineUsers = new();
        public ChatHub(IMemoryCache cache, ApplicationDbContext context)
        {
            _cache = cache;
            _context = context;
        }

        public async Task JoinChat(UserConnection connection)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, connection.ChatRoom);

            var stringConnection = JsonSerializer.Serialize(connection);

             _cache.Set(Context.ConnectionId, stringConnection);

            OnlineUsers[connection.FromEmail] = Context.ConnectionId;
            await Clients.Group(connection.ChatRoom).UserStatusChanged(connection.FromEmail, true);
        }


        public async Task SendMessage(string message)
        {
            var stringConnection = _cache.Get<string>(Context.ConnectionId);

            if (!string.IsNullOrEmpty(stringConnection))
            {
                var connection = JsonSerializer.Deserialize<UserConnection>(stringConnection);

                if (connection is not null)
                {
                    var chatMessage = new ChatMessage
                    {
                        FromEmail = connection.FromEmail, 
                        ToEmail = connection.ToEmail,    
                        Message = message,
                        ChatRoom = connection.ChatRoom,
                        SentAt = DateTime.UtcNow
                    };

                    _context.ChatMessages.Add(chatMessage);
                    await _context.SaveChangesAsync();

                    await Clients.Group(connection.ChatRoom)
                        .ReceiveMessage(connection.UserName, message);
                }
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
           var stringConnection =  _cache.Get<string>(Context.ConnectionId);
           var connection = JsonSerializer.Deserialize<UserConnection>(stringConnection);
            var email = OnlineUsers.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
            if (connection is not null)
            {
                 _cache.Remove(Context.ConnectionId);
                OnlineUsers.Remove(connection.FromEmail);
                await Clients.Group(connection.ChatRoom).UserStatusChanged(connection.FromEmail, false);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, connection.ChatRoom);
            }
        }

        public bool IsUserOnline(string email)
        {
            return OnlineUsers.ContainsKey(email);
        }
    }


    public class UserConnection
    {
        public string UserName { get; set; }
        public string FromEmail { get; set; }
        public string ToEmail { get; set; }
        public string ChatRoom { get; set; }
    }
}
