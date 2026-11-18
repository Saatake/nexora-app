namespace Nexora.Api.Dtos.Responses;

public class ProjectPdfExtractResponseDto
{
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "Tcc";
    public string ThematicArea { get; set; } = "TecnologiaInovacao";
    public List<string> Tags { get; set; } = new();
    public string? Advisor { get; set; }
    public string? AuthorRole { get; set; }
    public string? AuthorContribution { get; set; }
    public string? GithubLink { get; set; }
    public List<ProjectContentBlockResponseDto> ContentBlocks { get; set; } = new();
}
