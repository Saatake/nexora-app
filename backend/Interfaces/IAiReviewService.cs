using Nexora.Api.Dtos.Responses;
using Nexora.Api.Results;
using Nexora.Api.Models;

namespace Nexora.Api.Interfaces;

public interface IAiReviewService
{
    Task<AiReviewResult> ReviewProjectAsync(Project project);
    Task<ProjectPdfExtractResponseDto> ExtractFromPdfAsync(byte[] pdfBytes, string fileName);
}
