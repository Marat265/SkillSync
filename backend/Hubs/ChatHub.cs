using Microsoft.AspNetCore.SignalR;
using Portfolio.Models;

namespace Skillsync.Hubs
{
    public class ChatHub: Hub
    {
        public async Task JoinChat(Users user)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, user.Id);
        }
    }
}
