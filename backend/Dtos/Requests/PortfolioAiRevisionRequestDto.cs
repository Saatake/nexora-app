using System.ComponentModel.DataAnnotations;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Services;

namespace Nexora.Api.Dtos.Requests;

public class PortfolioAiRevisionRequestDto
{
    [Required]
    public PortfolioAiDraftDto Draft { get; set; } = null!;

    [Required, MaxLength(PortfolioAiDraftService.MaxRevisionInstructionLength)]
    public string Instruction { get; set; } = string.Empty;
}
