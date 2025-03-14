using Microsoft.AspNetCore.SignalR;
using Portfolio.Models;

namespace Skillsync.Hubs
{
    public class ChatHub: Hub
    {
        public async Task JoinChat(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }


    }
}
