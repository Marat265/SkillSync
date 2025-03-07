namespace Portfolio.Dto
{
    public class MentorProfileDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Image { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<string> Skills { get; set; } = new();
        public List<string> Reviews { get; set; } = new();
    }

}
