using Nexora.Api.Dtos.Responses;
using Nexora.Api.Models;

namespace Nexora.Api.Interfaces;

public interface IPortfolioAiDraftService
{
    Task<PortfolioAiDraftDto> GenerateAsync(ApplicationUser user, IReadOnlyCollection<Project> projects);
}
