namespace Skillsync.Dto
{
    public class ChatMessageDto
    {
        public string FromEmail { get; set; }

        public string ToEmail { get; set; }

        public string Message { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public string ChatRoom { get; set; }
    }
}
