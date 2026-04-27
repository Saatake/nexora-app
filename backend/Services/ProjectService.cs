using Microsoft.AspNetCore.Identity;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Results;

namespace Nexora.Api.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public ProjectService(IProjectRepository projectRepository, UserManager<ApplicationUser> userManager)
    {
        _projectRepository = projectRepository;
        _userManager = userManager;
    }

    public async Task<ProjectResponseDto> CreateProjectAsync(CreateProjectRequestDto request, string userId)
    {
        var project = new Project
        {
            Title = request.Title,
            Description = request.Description,
            GithubLink = request.GithubLink,
            FileUrl = request.FileUrl,
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
            FileUrl = created.FileUrl,
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
            FileUrl = p.FileUrl,
            Category = p.Category.ToString(),
            AuthorName = p.User?.Name ?? "Anônimo",
            CreatedAt = p.CreatedAt
        });
    }

    public async Task<PagedResponseDto<ProjectResponseDto>> GetFeedAsync(string? search, ProjectCategory? category, string? course, double? minGrade, string? sort, int page, int pageSize)
    {
        var (items, totalCount) = await _projectRepository.GetFilteredAsync(search, category, course, minGrade, sort, page, pageSize);

        return new PagedResponseDto<ProjectResponseDto>
        {
            Items = items.Select(MapToDto),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PagedResponseDto<ProjectResponseDto>> GetMyProjectsAsync(string userId, ProjectCategory? category, int page, int pageSize)
    {
        var (items, totalCount) = await _projectRepository.GetByUserAsync(userId, category, page, pageSize);

        return new PagedResponseDto<ProjectResponseDto>
        {
            Items = items.Select(MapToDto),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
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
        project.FileUrl = model.FileUrl;
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

    public async Task<ProjectResult> ApproveAsync(int id, string professorId)
    {
        var professor = await _userManager.FindByIdAsync(professorId);
        if (professor == null || professor.RoleType != UserRole.Professor)
            return new ProjectResult { Succeeded = false, IsForbidden = true, Message = "apenas professores podem aprovar projetos." };

        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
            return new ProjectResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        project.IsApproved = true;
        await _projectRepository.UpdateAsync(project);

        return new ProjectResult { Succeeded = true, Message = "projeto aprovado com sucesso!", Data = MapToDto(project) };
    }

    public async Task<ProjectResult> IncrementViewAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
            return new ProjectResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        project.ViewCount++;
        await _projectRepository.UpdateAsync(project);

        return new ProjectResult { Succeeded = true, Message = "visualização registrada." };
    }

    public async Task<ProjectResult> GetDownloadAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
            return new ProjectResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        if (string.IsNullOrWhiteSpace(project.FileUrl))
            return new ProjectResult { Succeeded = false, Message = "este projeto não possui arquivo para download." };

        project.DownloadCount++;
        await _projectRepository.UpdateAsync(project);

        return new ProjectResult { Succeeded = true, Message = project.FileUrl };
    }

    private static ProjectResponseDto MapToDto(Project p)
    {
        double? avgGrade = null;
        if (p.Evaluations != null && p.Evaluations.Any())
            avgGrade = Math.Round(p.Evaluations.Average(e => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0), 2);

        return new ProjectResponseDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            GithubLink = p.GithubLink,
            FileUrl = p.FileUrl,
            Category = p.Category.ToString(),
            AuthorName = p.User?.Name ?? "Anônimo",
            IsApproved = p.IsApproved,
            ViewCount = p.ViewCount,
            DownloadCount = p.DownloadCount,
            AverageGrade = avgGrade,
            CreatedAt = p.CreatedAt
        };
    }
}