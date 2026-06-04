using System.Text;
using System.Text.Json;

namespace Skillsync.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<string> GenerateAsync(string instructions, string input)
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                return BuildLocalFallback(input);
            }

            var model = _configuration["Gemini:Model"];
            if (string.IsNullOrWhiteSpace(model))
            {
                model = "gemini-2.5-flash";
            }

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent");

            request.Headers.Add("x-goog-api-key", apiKey);
            request.Content = new StringContent(
                JsonSerializer.Serialize(new
                {
                    systemInstruction = new
                    {
                        parts = new[]
                        {
                            new { text = instructions }
                        }
                    },
                    contents = new[]
                    {
                        new
                        {
                            role = "user",
                            parts = new[]
                            {
                                new { text = input }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.7,
                        maxOutputTokens = 900
                    }
                }),
                Encoding.UTF8,
                "application/json");

            using var response = await _httpClient.SendAsync(request);
            var responseText = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return $"Gemini service is temporarily unavailable. Gemini returned {(int)response.StatusCode}. " +
                       "SkillSync analytics and mentor matching still work without generated AI text.";
            }

            return ExtractOutputText(responseText);
        }

        private static string ExtractOutputText(string json)
        {
            using var document = JsonDocument.Parse(json);
            var root = document.RootElement;

            if (!root.TryGetProperty("candidates", out var candidates) ||
                candidates.ValueKind != JsonValueKind.Array)
            {
                return string.Empty;
            }

            var builder = new StringBuilder();
            foreach (var candidate in candidates.EnumerateArray())
            {
                if (!candidate.TryGetProperty("content", out var content) ||
                    !content.TryGetProperty("parts", out var parts) ||
                    parts.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var part in parts.EnumerateArray())
                {
                    if (part.TryGetProperty("text", out var text))
                    {
                        builder.AppendLine(text.GetString());
                    }
                }
            }

            return builder.ToString().Trim();
        }

        private static string BuildLocalFallback(string input)
        {
            return "Gemini AI mode is ready, but Gemini:ApiKey is not configured yet. " +
                   "Add your API key to user secrets or appsettings.Development.json. " +
                   "Until then, SkillSync can still show analytics and mentor matches from local data.\n\n" +
                   $"Request context: {input}";
        }
    }
}
