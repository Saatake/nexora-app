using System.ComponentModel.DataAnnotations;

namespace Nexora.Api.Dtos.Requests;

public class PortfolioAiDraftRequestDto
{
    [Required, MinLength(1), MaxLength(12)]
    public List<int> ProjectIds { get; set; } = new();
}
