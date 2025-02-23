using Portfolio.Enum;

namespace Portfolio.Dto
{
    public class SessionDto
    {
        public int SessionId { get; set; }
        public  UserDto Mentor { get; set; }
        public string Topic { get; set; }
        public DateTime StartTime { get; set; }
        public string Duration { get; set; }
        public int MaxStudents { get; set; }
        public int CurrentStudents { get; set; } = 0;

        public SessionStatus Status { get; set; }
    }
}
