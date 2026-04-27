namespace Nexora.Api.Results;

public class AuthResult
{
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public IEnumerable<string> Errors { get; set; } = new List<string>();
    public string Token { get; set; } = string.Empty;
    public bool IsUnauthorized { get; set; } = false; // Avisa se o erro foi de senha errada
}