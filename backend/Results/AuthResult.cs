namespace Nexora.Api.Results;

public class AuthResult : ServiceResult
{
    public string Token { get; set; } = string.Empty;
    public bool IsUnauthorized { get; set; } = false; // Avisa se o erro foi de senha errada
}