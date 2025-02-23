namespace Portfolio.Token
{
    public class JwtOptions
    {
        public string SecretKey { get; set; }
        public int ExpiresHour { get; set; }
    }
}
