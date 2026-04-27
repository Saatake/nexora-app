namespace Nexora.Api.Dtos.Responses;

public class ProjectResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string GithubLink { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
    public int ViewCount { get; set; }
    public int DownloadCount { get; set; }
    public double? AverageGrade { get; set; }
    public DateTime CreatedAt { get; set; }
}