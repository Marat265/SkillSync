using Skillsync.Dto.Sessions;

namespace Skillsync.Dto.Profiles
{
    public class StudentProfileDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Image { get; set; }
        public List<SessionDto> Sessions { get; set; } = new();
    }
}
