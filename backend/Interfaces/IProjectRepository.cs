using Nexora.Api.Enums;
using Nexora.Api.Models;

namespace Nexora.Api.Interfaces;

public interface IProjectRepository
{
    Task<Project> CreateAsync(Project project);
    Task<IEnumerable<Project>> GetAllAsync();
    Task<(IEnumerable<Project> Items, int TotalCount)> GetFilteredAsync(string? search, ProjectCategory? category, int page, int pageSize);
    Task<Project?> GetByIdAsync(int id);
    Task UpdateAsync(Project project);
    Task DeleteAsync(Project project);
}