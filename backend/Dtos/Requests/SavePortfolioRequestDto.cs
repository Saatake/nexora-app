using System.ComponentModel.DataAnnotations;

namespace Nexora.Api.Dtos.Requests;

public class SavePortfolioRequestDto
{
    [Required, RegularExpression("^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$")]
    public string Slug { get; set; } = string.Empty;
    [MaxLength(120)] public string Headline { get; set; } = string.Empty;
    [MaxLength(2000)] public string Bio { get; set; } = string.Empty;
    [MaxLength(1000)] public string Skills { get; set; } = string.Empty;
    [RegularExpression("^(forest|ocean|sunset)$")] public string Theme { get; set; } = "forest";
    public bool IsPublished { get; set; }
    public List<int> ProjectIds { get; set; } = new();
}
