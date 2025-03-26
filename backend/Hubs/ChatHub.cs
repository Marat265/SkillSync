using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Portfolio.Models;
using System.Text.Json;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Skillsync.Hubs
{
    public interface IChatClient
    {
        public Task ReceiveMessage(string userName, string message);
    }

    public class ChatHub: Hub<IChatClient>
    {
        private readonly IMemoryCache _cache;

        public ChatHub(IMemoryCache cache)
        {
            _cache = cache;
        }

        public async Task JoinChat(UserConnection connection)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, connection.ChatRoom);

            var stringConnection = JsonSerializer.Serialize(connection);

             _cache.Set(Context.ConnectionId, stringConnection);

            await Clients.Group(connection.ChatRoom)
                .ReceiveMessage("Admin",$"{ connection.UserName} присоеденился к чату" );
        }


        public async Task SendMessage(string message)
        {
            var stringConnection = _cache.Get<string>(Context.ConnectionId);

            if (!string.IsNullOrEmpty(stringConnection))
            {
                var connection = JsonSerializer.Deserialize<UserConnection>(stringConnection);

                if (connection is not null)
                {
                    await Clients.Group(connection.ChatRoom)
                        .ReceiveMessage(connection.UserName, message);
                }
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
           var stringConnection =  _cache.Get<string>(Context.ConnectionId);
           var connection = JsonSerializer.Deserialize<UserConnection>(stringConnection);

            if (connection is not null)
            {
                 _cache.Remove(Context.ConnectionId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, connection.ChatRoom);


                await Clients
                    .Group(connection.ChatRoom)
                    .ReceiveMessage("Admin", $"{connection.UserName}, вышел из чата");

            }
        }


    }


    public class UserConnection
    {
        public string UserName { get; set; }
        public string ChatRoom { get; set; }
    }
}
