namespace Portfolio.Dto.Auth
{
    public class RegisterModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public IFormFile Image { get; set; }
        public string Role { get; set; }
    }
}
