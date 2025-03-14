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
    }
}
