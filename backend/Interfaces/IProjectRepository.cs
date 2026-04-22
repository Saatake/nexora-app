using Nexora.Api.Models;

namespace Nexora.Api.Interfaces;

public interface IProjectRepository
{
    Task<Project> CreateAsync(Project project);
    Task<IEnumerable<Project>> GetAllAsync();
    Task<Project?> GetByIdAsync(int id);
}