namespace Nexora.Api.Dtos.Responses;

public class PortfolioResponseDto
{
    public string Name { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new();
    public string Theme { get; set; } = "forest";
    public PortfolioDesignSpecDto DesignSpec { get; set; } = PortfolioDesignSpecDto.CreateDefault();
    public bool IsPublished { get; set; }
    public List<PortfolioProjectResponseDto> Projects { get; set; } = new();
}

public class PortfolioProjectResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string? Contribution { get; set; }
    public string? VisualSummary { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ThematicArea { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? GithubLink { get; set; }
    public string? FileUrl { get; set; }
}
