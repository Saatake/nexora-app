using Nexora.Api.Models;

namespace Nexora.Api.Results;

public class ProjectResult
{
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public IEnumerable<string> Errors { get; set; } = new List<string>();
    public Project? Data { get; set; }
}