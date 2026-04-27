using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Results;

namespace Nexora.Api.Interfaces;

public interface IProjectService
{
    Task<ProjectResponseDto> CreateProjectAsync(CreateProjectRequestDto model, string userId);
    Task<IEnumerable<ProjectResponseDto>> GetFeedAsync();
    Task<ProjectResult> GetByIdAsync(int id);
    Task<ProjectResult> UpdateAsync(int id, UpdateProjectRequestDto model, string userId);
    Task<ProjectResult> DeleteAsync(int id, string userId);
}