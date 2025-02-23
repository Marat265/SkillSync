namespace Portfolio.Dto
{
    public class CreateSessionModel
    {
        public string Topic { get; set; }
        public DateTime StartTime { get; set; }
        public string Duration { get; set; }
        public int MaxStudents { get; set; }
    }
}
