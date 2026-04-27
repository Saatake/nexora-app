using Nexora.Api.Dtos.Responses;

namespace Nexora.Api.Results;

public class ProjectResult
{
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public IEnumerable<string> Errors { get; set; } = new List<string>();
    public ProjectResponseDto? Data { get; set; }
    public bool IsNotFound { get; set; } = false;
    public bool IsForbidden { get; set; } = false;
}
