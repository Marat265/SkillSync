using System.ComponentModel.DataAnnotations.Schema;

namespace Portfolio.Models
{
    public class Skills
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<MentorSkills> MentorSkills { get; set; }
    }
}
