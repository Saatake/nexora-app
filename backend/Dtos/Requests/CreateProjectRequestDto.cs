using Nexora.Api.Enums;

namespace Nexora.Api.Dtos.Requests;

public class CreateProjectRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string GithubLink { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public ProjectCategory Category { get; set; }
}

public class UpdateProjectRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string GithubLink { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public ProjectCategory Category { get; set; }
}