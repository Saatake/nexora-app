using Nexora.Api.Dtos.Responses;

namespace Nexora.Api.Results;

public class AiReviewResult
{
    public bool Succeeded { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsNotFound { get; set; } = false;
    public AiReviewResponseDto? Data { get; set; }
}
