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
    private readonly IAiReviewService _aiReviewService;

    public ProjectService(IProjectRepository projectRepository, UserManager<ApplicationUser> userManager, IAiReviewService aiReviewService)
    {
        _projectRepository = projectRepository;
        _userManager = userManager;
        _aiReviewService = aiReviewService;
    }

    public async Task<ProjectResponseDto> CreateProjectAsync(CreateProjectRequestDto request, string userId)
    {
        var project = new Project
        {
            Title = request.Title,
            Description = request.Description,
            Summary = request.Summary,
            Course = request.Course,
            Area = request.Area,
            Advisor = request.Advisor,
            TeamMembers = request.TeamMembers,
            GithubLink = request.GithubLink,
            FileUrl = request.FileUrl,
            ImageUrl = request.ImageUrl,
            Category = request.Category,
            IsPrivate = request.IsPrivate,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _projectRepository.CreateAsync(project);

        if (request.CollaboratorIds.Count > 0)
            await _projectRepository.SetCollaboratorsAsync(created.Id, request.CollaboratorIds);

        var full = await _projectRepository.GetByIdAsync(created.Id);
        return MapToDto(full!);
    }

    public async Task<IEnumerable<ProjectResponseDto>> GetFeedAsync()
    {
        var projects = await _projectRepository.GetAllAsync();

        return projects.Select(p => new ProjectResponseDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            Summary = p.Summary,
            Course = p.Course,
            Area = p.Area,
            Advisor = p.Advisor,
            TeamMembers = p.TeamMembers,
            GithubLink = p.GithubLink,
            FileUrl = p.FileUrl,
            ImageUrl = p.ImageUrl,
            Category = p.Category.ToString(),
            IsPrivate = p.IsPrivate,
            AuthorId = p.UserId,
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
        project.Summary = model.Summary;
        project.Course = model.Course;
        project.Area = model.Area;
        project.Advisor = model.Advisor;
        project.TeamMembers = model.TeamMembers;
        project.GithubLink = model.GithubLink;
        project.FileUrl = model.FileUrl;
        project.ImageUrl = model.ImageUrl;
        project.Category = model.Category;
        project.IsPrivate = model.IsPrivate;

        await _projectRepository.UpdateAsync(project);
        await _projectRepository.SetCollaboratorsAsync(project.Id, model.CollaboratorIds);

        var updated = await _projectRepository.GetByIdAsync(project.Id);
        return new ProjectResult { Succeeded = true, Message = "projeto atualizado com sucesso!", Data = MapToDto(updated!) };
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

    public async Task<ProjectResult> IncrementViewAsync(int id, string? currentUserId = null)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
            return new ProjectResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        if(project.UserId != currentUserId)
        {
        project.ViewCount++;
        await _projectRepository.UpdateAsync(project);
        }

        // retorna sucesso, porém se for o autor do projeto não contabiliza a view
        return new ProjectResult { Succeeded = true, Message = "visualização registrada." };
    }

    public async Task<PagedResponseDto<ProjectResponseDto>> GetCollaboratedProjectsAsync(string userId, int page, int pageSize)
    {
        var (items, totalCount) = await _projectRepository.GetCollaboratedAsync(userId, page, pageSize);

        return new PagedResponseDto<ProjectResponseDto>
        {
            Items = items.Select(MapToDto),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
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
            Summary = p.Summary,
            Course = p.Course,
            Area = p.Area,
            Advisor = p.Advisor,
            TeamMembers = p.TeamMembers,
            GithubLink = p.GithubLink,
            FileUrl = p.FileUrl,
            ImageUrl = p.ImageUrl,
            Category = p.Category.ToString(),
            AuthorName = p.User?.Name ?? "Anônimo",
            AuthorId = p.UserId,
            ViewCount = p.ViewCount,
            DownloadCount = p.DownloadCount,
            AverageGrade = avgGrade,
            IsPrivate = p.IsPrivate,
            CreatedAt = p.CreatedAt,
            Collaborators = p.Collaborators?
                .Where(c => c.User != null)
                .Select(c => new CollaboratorDto
                {
                    Id = c.UserId,
                    Name = c.User!.Name,
                    PhotoUrl = c.User.PhotoUrl,
                    Course = c.User.Course
                }).ToList() ?? new()
        };
    }

    public async Task<AiReviewResult> GenerateAiReviewAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);

        if(project == null) 
            return new AiReviewResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };
        
        return await _aiReviewService.ReviewProjectAsync(project);
    }
}