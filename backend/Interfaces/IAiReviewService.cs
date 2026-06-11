using Nexora.Api.Results;

namespace Nexora.Api.Interfaces;

public interface IAiReviewService
{
    Task<AiReviewResult> ReviewProjectAsync(int projectId);
}
