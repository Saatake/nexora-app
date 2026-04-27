using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Results;

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
            Category = request.Category,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _projectRepository.CreateAsync(project);

        return new ProjectResponseDto
        {
            Id = created.Id,
            Title = created.Title,
            Description = created.Description,
            GithubLink = created.GithubLink,
            ImageUrl = created.ImageUrl,
            Category = created.Category.ToString(),
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
            Category = p.Category.ToString(),
            AuthorName = p.User?.Name ?? "Anônimo",
            CreatedAt = p.CreatedAt
        });
    }

    public async Task<ProjectResult> GetByIdAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
            return new ProjectResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        return new ProjectResult
        {
            Succeeded = true,
            Data = MapToDto(project)
        };
    }

    public async Task<ProjectResult> UpdateAsync(int id, UpdateProjectRequestDto model, string userId)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
            return new ProjectResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        if (project.UserId != userId)
            return new ProjectResult { Succeeded = false, IsForbidden = true, Message = "você não tem permissão para editar este projeto." };

        project.Title = model.Title;
        project.Description = model.Description;
        project.GithubLink = model.GithubLink;
        project.ImageUrl = model.ImageUrl;
        project.Category = model.Category;

        await _projectRepository.UpdateAsync(project);

        return new ProjectResult { Succeeded = true, Message = "projeto atualizado com sucesso!", Data = MapToDto(project) };
    }

    public async Task<ProjectResult> DeleteAsync(int id, string userId)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
            return new ProjectResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        if (project.UserId != userId)
            return new ProjectResult { Succeeded = false, IsForbidden = true, Message = "você não tem permissão para deletar este projeto." };

        await _projectRepository.DeleteAsync(project);

        return new ProjectResult { Succeeded = true, Message = "projeto deletado com sucesso!" };
    }

    private static ProjectResponseDto MapToDto(Project p)
    {
        return new ProjectResponseDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            GithubLink = p.GithubLink,
            ImageUrl = p.ImageUrl,
            Category = p.Category.ToString(),
            AuthorName = p.User?.Name ?? "Anônimo",
            CreatedAt = p.CreatedAt
        };
    }
}