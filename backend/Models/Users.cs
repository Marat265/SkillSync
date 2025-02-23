using Microsoft.AspNetCore.Identity;
using Portfolio.Enum;
using System.ComponentModel.DataAnnotations.Schema;

namespace Portfolio.Models
{
    public class Users:IdentityUser
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public List<Session> Sessions { get; set; } = new();
        public List<Reviews> Reviews { get; set; } = new();
        public List<MentorSkills> MentorSkills { get; set; } = new();


    }
}
