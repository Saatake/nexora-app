using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;

namespace Nexora.Api.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;

    public ProjectService(IProjectRepository projectRepository)
    {
        _projectRepository = projectRepository;
    }

    public async Task<ProjectResponseDto> CreateProjectAsync(CreateProjectRequestDto request, string userId)
    {
        var project = new Project
        {
            Title = request.Title,
            Description = request.Description,
            GithubLink = request.GithubLink,
            ImageUrl = request.ImageUrl,
            Category = request.Category.ToString(),
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _projectRepository.CreateAsync(project);

        return new ProjectResponseDto
        {
            Id = created.Id,
            Title = created.Title,
            Description = created.Description,
            Category = created.Category,
            CreatedAt = created.CreatedAt
        };
    }

    public async Task<IEnumerable<ProjectResponseDto>> GetFeedAsync()
    {
        var projects = await _projectRepository.GetAllAsync();

        return projects.Select(p => new ProjectResponseDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            GithubLink = p.GithubLink,
            ImageUrl = p.ImageUrl,
            Category = p.Category,
            AuthorName = p.User?.Name ?? "Anônimo",
            CreatedAt = p.CreatedAt
        });
    }
}