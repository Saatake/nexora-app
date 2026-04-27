using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Enums;
using Nexora.Api.Results;

namespace Nexora.Api.Interfaces;

public interface IProjectService
{
    Task<ProjectResponseDto> CreateProjectAsync(CreateProjectRequestDto model, string userId);
    Task<IEnumerable<ProjectResponseDto>> GetFeedAsync();
    Task<PagedResponseDto<ProjectResponseDto>> GetFeedAsync(string? search, ProjectCategory? category, string? course, double? minGrade, string? sort, int page, int pageSize);
    Task<PagedResponseDto<ProjectResponseDto>> GetMyProjectsAsync(string userId, ProjectCategory? category, int page, int pageSize);
    Task<ProjectResult> GetByIdAsync(int id);
    Task<ProjectResult> UpdateAsync(int id, UpdateProjectRequestDto model, string userId);
    Task<ProjectResult> DeleteAsync(int id, string userId);
    Task<ProjectResult> ApproveAsync(int id, string professorId);
    Task<ProjectResult> IncrementViewAsync(int id);
    Task<ProjectResult> GetDownloadAsync(int id);
}