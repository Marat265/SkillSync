using System.ComponentModel.DataAnnotations.Schema;

namespace Portfolio.Models
{
    public class Reviews
    {
        public int ReviewId { get; set; }
        public string MentorId { get; set; }
        public string StudentId { get; set; }
        public double Rating { get; set; }
        public string Comment { get; set; }
        public Users Mentor { get; set; }
        public Users Student { get; set; }
    }
}
