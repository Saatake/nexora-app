namespace Nexora.Api.Dtos.Responses;

public class ProjectResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? Course { get; set; }
    public string? Area { get; set; }
    public string? Advisor { get; set; }
    public string? TeamMembers { get; set; }
    public string GithubLink { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string Category { get; set; } = string.Empty;
    public string AuthorId { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public int ViewCount { get; set; }
    public int DownloadCount { get; set; }
    public double? AverageGrade { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsPrivate { get; set; }
}