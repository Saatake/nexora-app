namespace Nexora.Api.Results;

public class BadgeResult
{
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsNotFound { get; set; } = false;
}
