namespace Portfolio.Dto
{
    public class StudentProfileDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public List<SessionDto> Sessions { get; set; } = new(); 
    }
}
