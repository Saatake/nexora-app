using Nexora.Api.Results;
using Nexora.Api.Models;

namespace Nexora.Api.Interfaces;

public interface IAiReviewService
{
    Task<AiReviewResult> ReviewProjectAsync(Project project);
}
