using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Portfolio.Data;
using Portfolio.Models;
using Skillsync.Models;
using System.Text.Json;

namespace Skillsync.Hubs
{
    public interface IChatClient
    {
        Task ReceiveMessage(string userName, string message, DateTime sentAt, string fromEmail);
        Task UserStatusChanged(string email, bool isOnline);
        Task ReceiveCall(string callerName, string callerEmail);
        Task CallAnswered(bool accepted);
        Task ReceiveOffer(string offer);
        Task ReceiveAnswer(string answer);
        Task ReceiveIceCandidate(string candidate);
        Task CallEnded();
        Task ReceiveNewMessageNotification(string fromEmail, string chatRoom, string preview, DateTime sentAt);
    }

    public class ChatHub : Hub<IChatClient>
    {
        private readonly IMemoryCache _cache;
        private readonly ApplicationDbContext _context;
        private static readonly object OnlineUsersLock = new();
        private static readonly Dictionary<string, HashSet<string>> OnlineUsers = new();
        private static readonly Dictionary<string, string> ConnectionEmails = new();

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

            AddOnlineConnection(connection.FromEmail, Context.ConnectionId);
            foreach (var connId in GetOnlineConnections(connection.ToEmail))
            {
                await Clients.Client(connId).UserStatusChanged(connection.FromEmail, true);
            }
        }

        public async Task JoinNotifications(string email)
        {
            if (!string.IsNullOrWhiteSpace(email))
                await Groups.AddToGroupAsync(Context.ConnectionId, $"notify_{email}");
        }

        public async Task SendMessage(string message)
        {
            var stringConnection = _cache.Get<string>(Context.ConnectionId);
            if (string.IsNullOrEmpty(stringConnection)) return;

            var connection = JsonSerializer.Deserialize<UserConnection>(stringConnection);
            if (connection is null) return;

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
                .ReceiveMessage(connection.UserName, message, chatMessage.SentAt, connection.FromEmail);

            await Clients.Group($"notify_{connection.ToEmail}")
                .ReceiveNewMessageNotification(connection.FromEmail, connection.ChatRoom, message, chatMessage.SentAt);
        }


        public async Task CallUser(string targetEmail, string callerName, string callerEmail)
        {
            foreach (var connectionId in GetOnlineConnections(targetEmail))
            {
                await Clients.Client(connectionId).ReceiveCall(callerName, callerEmail);
            }
        }

        public async Task AnswerCall(string callerEmail, bool accepted)
        {
            foreach (var connectionId in GetOnlineConnections(callerEmail))
            {
                await Clients.Client(connectionId).CallAnswered(accepted);
            }
        }

        public async Task SendOffer(string targetEmail, string offer)
        {
            foreach (var connectionId in GetOnlineConnections(targetEmail))
            {
                await Clients.Client(connectionId).ReceiveOffer(offer);
            }
        }

        public async Task SendAnswer(string targetEmail, string answer)
        {
            foreach (var connectionId in GetOnlineConnections(targetEmail))
            {
                await Clients.Client(connectionId).ReceiveAnswer(answer);
            }
        }

        public async Task SendIceCandidate(string targetEmail, string candidate)
        {
            foreach (var connectionId in GetOnlineConnections(targetEmail))
            {
                await Clients.Client(connectionId).ReceiveIceCandidate(candidate);
            }
        }

        public async Task EndCall(string targetEmail)
        {
            foreach (var connectionId in GetOnlineConnections(targetEmail))
            {
                await Clients.Client(connectionId).CallEnded();
            }
        }


        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var stringConnection = _cache.Get<string>(Context.ConnectionId);
            if (stringConnection is not null)
            {
                var connection = JsonSerializer.Deserialize<UserConnection>(stringConnection);
                if (connection is not null)
                {
                    _cache.Remove(Context.ConnectionId);
                    var stillOnline = RemoveOnlineConnection(Context.ConnectionId);
                    if (!stillOnline)
                    {
                        foreach (var connId in GetOnlineConnections(connection.ToEmail))
                        {
                            await Clients.Client(connId).UserStatusChanged(connection.FromEmail, false);
                        }
                    }
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, connection.ChatRoom);
                }
            }
        }

        public Task<bool> IsUserOnline(string email)
            => Task.FromResult(GetOnlineConnections(email).Count > 0);

        private static void AddOnlineConnection(string email, string connectionId)
        {
            if (string.IsNullOrWhiteSpace(email)) return;

            lock (OnlineUsersLock)
            {
                if (!OnlineUsers.TryGetValue(email, out var connections))
                {
                    connections = new HashSet<string>();
                    OnlineUsers[email] = connections;
                }

                connections.Add(connectionId);
                ConnectionEmails[connectionId] = email;
            }
        }

        private static bool RemoveOnlineConnection(string connectionId)
        {
            lock (OnlineUsersLock)
            {
                if (!ConnectionEmails.TryGetValue(connectionId, out var email)) return false;

                ConnectionEmails.Remove(connectionId);
                if (!OnlineUsers.TryGetValue(email, out var connections)) return false;

                connections.Remove(connectionId);
                if (connections.Count == 0)
                {
                    OnlineUsers.Remove(email);
                    return false;
                }

                return true;
            }
        }

        private static IReadOnlyList<string> GetOnlineConnections(string email)
        {
            lock (OnlineUsersLock)
            {
                if (!OnlineUsers.TryGetValue(email, out var connections))
                {
                    return Array.Empty<string>();
                }

                return connections.ToList();
            }
        }
    }

    public class UserConnection
    {
        public string UserName { get; set; } = "";
        public string FromEmail { get; set; } = "";
        public string ToEmail { get; set; } = "";
        public string ChatRoom { get; set; } = "";
    }
}
