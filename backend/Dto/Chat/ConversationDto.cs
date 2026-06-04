namespace Skillsync.Dto.Chat
{
    public class ConversationDto
    {
        public string ChatRoom { get; set; } = string.Empty;
        public string PartnerEmail { get; set; } = string.Empty;
        public string PartnerName { get; set; } = string.Empty;
        public string PartnerImage { get; set; } = string.Empty;
        public string LastMessage { get; set; } = string.Empty;
        public DateTime LastMessageAt { get; set; }
        public string LastSenderEmail { get; set; } = string.Empty;
    }
}
