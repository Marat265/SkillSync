namespace Skillsync.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }

        public string FromEmail { get; set; }

        public string ToEmail { get; set; }

        public string Message { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public string ChatRoom { get; set; }
    }
}
