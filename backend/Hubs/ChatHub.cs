using Microsoft.AspNetCore.SignalR;
using Portfolio.Models;

namespace Skillsync.Hubs
{

    public interface IChatClient
    {
        public Task ReceiveMessage(string userName, string message);
    }

    public class ChatHub: Hub<IChatClient>
    {
        public async Task JoinChat(UserConnection connection)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, connection.ChatRoom);
            await Clients.Group(connection.ChatRoom).ReceiveMessage("Admin",$"{ connection.UserName} присоеденился к чату" );
        }

        //public async Task SendMessage(string user, string message)
        //{
        //    await Clients.All.SendAsync("ReceiveMessage", user, message);
        //}


    }

    public class UserConnection
    {
        public string UserName { get; set; }
        public string ChatRoom { get; set; }
    }
}
