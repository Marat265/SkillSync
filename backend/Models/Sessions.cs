using Portfolio.Enum;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Portfolio.Models
{
    public class Session
    {
        [Key]
        public int SessionId { get; set; } 

        public string MentorId { get; set; }  
        public Users Mentor { get; set; }  

        public string Topic { get; set; }  
        public DateTime StartTime { get; set; }  
        public string Duration { get; set; }  
        public int MaxStudents { get; set; }  
        public int CurrentStudents { get; set; } = 0;  

        public SessionStatus Status { get; set; }  // Статус сессии (например, "Запланирована", "Проходит", "Завершена")

        public List<SessionRegistration> Registrations { get; set; } = new();  // Список регистраций студентов
    }

    public class SessionRegistration
    {
        [Key]
        public int Id { get; set; }  

        public string StudentId { get; set; } 
        public Users Student { get; set; }  

        public int SessionId { get; set; } 
        public Session Session { get; set; }  

        public SessionStatus Status { get; set; }  // Статус записи (например, "Зарегистрирован", "Ожидает")
    }


}
