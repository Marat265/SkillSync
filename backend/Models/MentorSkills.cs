using System.ComponentModel.DataAnnotations.Schema;

namespace Portfolio.Models
{
    public class MentorSkills
    {
        public string MentorId { get; set; }
        public Users Mentor { get; set; }
        public int SkillId { get; set; }
        public Skills Skill { get; set; }
    }
}
