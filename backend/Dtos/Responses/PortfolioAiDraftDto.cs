namespace Nexora.Api.Dtos.Responses;

public class PortfolioAiDraftDto
{
    public string Headline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new();
}
