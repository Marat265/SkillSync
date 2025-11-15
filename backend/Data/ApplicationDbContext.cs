using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Portfolio.Models;
using Microsoft.AspNetCore.Http;
using Skillsync.Models;

namespace Portfolio.Data
{
    public class ApplicationDbContext : IdentityDbContext<Users>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            :base(options) 
        {
        }

        public DbSet<Users> Users { get; set; }
        public DbSet<Skills> Skills { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<SessionRegistration> SessionRegistrations { get; set; }
        public DbSet<Reviews> Reviews { get; set; }
        public DbSet<MentorSkills> MentorSkills { get;set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Reviews>()
                .HasKey(r => r.ReviewId);

            modelBuilder.Entity<Reviews>()
                .HasOne(r => r.Mentor)
                .WithMany()
                .HasForeignKey(r => r.MentorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reviews>()
                .HasOne(r => r.Student)
                .WithMany()
                .HasForeignKey(r => r.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MentorSkills>()
                .HasKey(ms => new { ms.MentorId, ms.SkillId });

            modelBuilder.Entity<MentorSkills>()
                .HasOne(ms => ms.Mentor)
                .WithMany(u => u.MentorSkills)
                .HasForeignKey(ms => ms.MentorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MentorSkills>()
                .HasOne(ms => ms.Skill)
                .WithMany(u => u.MentorSkills)
                .HasForeignKey(ms => ms.SkillId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SessionRegistration>()
            .HasKey(sr => sr.Id);

            modelBuilder.Entity<SessionRegistration>()
                .HasOne(sr => sr.Student)
                .WithMany()
                .HasForeignKey(sr => sr.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SessionRegistration>()
                .HasOne(sr => sr.Session)
                .WithMany(s => s.Registrations)
                .HasForeignKey(sr => sr.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Настройка отношений для Session
            modelBuilder.Entity<Session>()
                .HasKey(s => s.SessionId);

            modelBuilder.Entity<Session>()
                .HasOne(s => s.Mentor)
                .WithMany()
                .HasForeignKey(s => s.MentorId)
                .OnDelete(DeleteBehavior.Restrict);


            base.OnModelCreating(modelBuilder);
        }


    }
}
