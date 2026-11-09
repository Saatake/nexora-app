namespace Nexora.Api.Dtos.Responses;

public class PortfolioAiDraftDto
{
    public string Headline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new();
    public int ImagesAnalyzed { get; set; }
    public int ImagesUnavailable { get; set; }
    public List<PortfolioAiProjectDraftDto> Projects { get; set; } = new();
}

public class PortfolioAiProjectDraftDto
{
    public int ProjectId { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string Contribution { get; set; } = string.Empty;
    public string VisualSummary { get; set; } = string.Empty;
}
