namespace Skillsync.Dto.Ai
{
    public class AiPromptRequest
    {
        public string Message { get; set; } = string.Empty;
    }

    public class AiPromptResponse
    {
        public string Answer { get; set; } = string.Empty;
    }

    public class TopicStatDto
    {
        public string Topic { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class MentorAnalyticsDto
    {
        public int TotalSessions { get; set; }
        public int ScheduledSessions { get; set; }
        public int CompletedSessions { get; set; }
        public int TotalStudents { get; set; }
        public double AverageFillRate { get; set; }
        public List<TopicStatDto> TopTopics { get; set; } = new();
        public string AiSummary { get; set; } = string.Empty;
    }

    public class MentorMatchDto
    {
        public string MentorId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public int Score { get; set; }
        public string Reason { get; set; } = string.Empty;
        public List<string> Skills { get; set; } = new();
        public List<string> UpcomingSessions { get; set; } = new();
    }

    public class MentorMatchResponse
    {
        public string Goal { get; set; } = string.Empty;
        public List<MentorMatchDto> Matches { get; set; } = new();
        public string AiAdvice { get; set; } = string.Empty;
    }
}
