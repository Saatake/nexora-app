using Nexora.Api.Dtos;
using Nexora.Api.Results;

namespace Nexora.Api.Interfaces;

public interface IProjectService
{
    Task<ProjectResult> CreateProjectAsync(CreateProjectDto model, string userId);
    Task<IEnumerable<Project>> GetFeedAsync();
}