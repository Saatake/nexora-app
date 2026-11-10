using System.ComponentModel.DataAnnotations;
using Nexora.Api.Dtos.Responses;

namespace Nexora.Api.Dtos.Requests;

public class SavePortfolioRequestDto
{
    [Required, RegularExpression("^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$")]
    public string Slug { get; set; } = string.Empty;
    [MaxLength(120)] public string Headline { get; set; } = string.Empty;
    [MaxLength(2000)] public string Bio { get; set; } = string.Empty;
    [MaxLength(1000)] public string Skills { get; set; } = string.Empty;
    [RegularExpression("^(forest|ocean|sunset)$")] public string Theme { get; set; } = "forest";
    public PortfolioDesignSpecDto? DesignSpec { get; set; }
    public bool IsPublished { get; set; }
    public List<int> ProjectIds { get; set; } = new();
    public List<SavePortfolioProjectDraftDto> ProjectDrafts { get; set; } = new();
}

public class SavePortfolioProjectDraftDto
{
    public int ProjectId { get; set; }
    [MaxLength(1200)] public string PortfolioSummary { get; set; } = string.Empty;
    [MaxLength(800)] public string Contribution { get; set; } = string.Empty;
    [MaxLength(500)] public string VisualSummary { get; set; } = string.Empty;
}
