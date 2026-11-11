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
            ThematicArea = request.ThematicArea,
            Tags = request.SelectedTags is null ? NormalizeTags(request.Tags) : NormalizeSelectedTags(request.SelectedTags),
            Advisor = request.Advisor,
            TeamMembers = request.TeamMembers,
            GithubLink = request.GithubLink,
            FileUrl = request.FileUrl,
            ImageUrl = request.ImageUrl,
            AuthorContribution = request.AuthorContribution?.Trim(),
            Category = request.Category,
            IsPrivate = request.IsPrivate,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            ContentBlocks = MapContentBlocks(request.ContentBlocks)
        };

        var created = await _projectRepository.CreateAsync(project);

        var collaborators = GetCollaborators(request.Collaborators, request.CollaboratorIds);
        if (collaborators.Count > 0)
            await _projectRepository.SetCollaboratorsAsync(created.Id, collaborators);

        var full = await _projectRepository.GetByIdAsync(created.Id);
        return MapToDto(full!);
    }

    public async Task<IEnumerable<ProjectResponseDto>> GetFeedAsync()
    {
        var projects = await _projectRepository.GetAllAsync();
        return projects.Select(MapToDto);
    }

    public async Task<PagedResponseDto<ProjectResponseDto>> GetFeedAsync(string? search, ProjectCategory? category, ThematicArea? thematicArea, double? minGrade, string? sort, int page, int pageSize)
    {
        var (items, totalCount) = await _projectRepository.GetFilteredAsync(search, category, thematicArea, minGrade, sort, page, pageSize);

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
        project.ThematicArea = model.ThematicArea;
        project.Tags = model.SelectedTags is null ? NormalizeTags(model.Tags) : NormalizeSelectedTags(model.SelectedTags);
        project.Advisor = model.Advisor;
        project.TeamMembers = model.TeamMembers;
        project.GithubLink = model.GithubLink;
        project.FileUrl = model.FileUrl;
        project.ImageUrl = model.ImageUrl;
        project.AuthorContribution = model.AuthorContribution?.Trim();
        project.Category = model.Category;
        project.IsPrivate = model.IsPrivate;

        if (model.ContentBlocks is not null)
        {
            project.ContentBlocks.Clear();
            foreach (var block in MapContentBlocks(model.ContentBlocks))
                project.ContentBlocks.Add(block);
        }

        await _projectRepository.UpdateAsync(project);
        await _projectRepository.SetCollaboratorsAsync(project.Id, GetCollaborators(model.Collaborators, model.CollaboratorIds));

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

    public async Task<ProjectResult> GetDownloadAsync(int id, string? currentUserId = null)
    {
        var project = await _projectRepository.GetByIdAsync(id);
        if (project == null)
            return new ProjectResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        if (string.IsNullOrWhiteSpace(project.FileUrl))
            return new ProjectResult { Succeeded = false, Message = "este projeto não possui arquivo para download." };

        if (project.UserId != currentUserId)
        {
            project.DownloadCount++;
            await _projectRepository.UpdateAsync(project);
        }

        return new ProjectResult { Succeeded = true, Message = project.FileUrl };
    }

    // peso da nota de professor na média ponderada final (interna, para ranking)
    private const double ProfessorWeight = 3.0;

    private static ProjectResponseDto MapToDto(Project p)
    {
        double? communityAvg = null;
        double? professorAvg = null;
        double? weightedAvg = null;
        var communityCount = 0;
        var professorCount = 0;

        if (p.Evaluations != null && p.Evaluations.Any())
        {
            static double BaseAvg(Evaluation e) => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0;

            var professorEvals = p.Evaluations.Where(e => e.Professor?.RoleType == UserRole.Professor).ToList();
            var communityEvals = p.Evaluations.Where(e => e.Professor?.RoleType != UserRole.Professor).ToList();

            professorCount = professorEvals.Count;
            communityCount = communityEvals.Count;

            if (professorCount > 0)
                professorAvg = Math.Round(professorEvals.Average(BaseAvg), 2);

            if (communityCount > 0)
                communityAvg = Math.Round(communityEvals.Average(BaseAvg), 2);

            var totalWeight = communityCount + professorCount * ProfessorWeight;
            if (totalWeight > 0)
            {
                var sum = communityEvals.Sum(BaseAvg) + professorEvals.Sum(BaseAvg) * ProfessorWeight;
                weightedAvg = Math.Round(sum / totalWeight, 2);
            }
        }

        return new ProjectResponseDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            Summary = p.Summary,
            ThematicArea = p.ThematicArea,
            ThematicAreaName = p.ThematicArea.ToString(),
            Tags = p.Tags,
            SelectedTags = GetSelectedTags(p.Tags),
            Advisor = p.Advisor,
            TeamMembers = p.TeamMembers,
            GithubLink = p.GithubLink,
            FileUrl = p.FileUrl,
            ImageUrl = p.ImageUrl,
            AuthorContribution = p.AuthorContribution,
            Category = p.Category.ToString(),
            AuthorName = p.User?.Name ?? "Anônimo",
            AuthorId = p.UserId,
            AuthorRoleType = p.User?.RoleType.ToString() ?? string.Empty,
            ViewCount = p.ViewCount,
            DownloadCount = p.DownloadCount,
            AverageGrade = weightedAvg,
            CommunityAverage = communityAvg,
            CommunityCount = communityCount,
            ProfessorAverage = professorAvg,
            ProfessorCount = professorCount,
            IsPrivate = p.IsPrivate,
            CreatedAt = p.CreatedAt,
            ContentBlocks = p.ContentBlocks?
                .OrderBy(block => block.SortOrder)
                .ThenBy(block => block.Id)
                .Select(block => new ProjectContentBlockResponseDto
                {
                    Type = block.Type.ToString(),
                    Text = block.Text,
                    Url = block.Url,
                    Caption = block.Caption,
                    SortOrder = block.SortOrder
                }).ToList() ?? new(),
            Collaborators = p.Collaborators?
                .Where(c => c.User != null)
                .Select(c => new CollaboratorDto
                {
                    Id = c.UserId,
                    Name = c.User!.Name,
                    PhotoUrl = c.User.PhotoUrl,
                    Course = c.User.Course,
                    Contribution = c.Contribution
                }).ToList() ?? new(),
            Badges = p.Badges?
                .GroupBy(b => b.Badge)
                .Select(g => new ProjectBadgeDto
                {
                    Badge = g.Key.ToString(),
                    Count = g.Count(),
                    Professors = g.Select(b => new BadgeProfessorDto
                    {
                        Id = b.ProfessorId,
                        Name = b.Professor?.Name ?? "",
                        AwardedAt = b.CreatedAt
                    }).ToList()
                }).ToList() ?? new()
        };
    }

    private static string? NormalizeTags(string? tags)
    {
        if (string.IsNullOrWhiteSpace(tags))
            return null;

        return string.Join(", ", tags
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(t => t.ToLowerInvariant())
            .Distinct());
    }

    private static string? NormalizeSelectedTags(IEnumerable<string>? tags) =>
        ProjectTagCatalog.TryNormalize(tags, out var normalized) ? normalized : null;

    private static List<string> GetSelectedTags(string? tags) => string.IsNullOrWhiteSpace(tags)
        ? new()
        : tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(tag => ProjectTagCatalog.TryCanonicalize(tag, out var canonical) ? canonical : tag)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

    private static ICollection<ProjectContentBlock> MapContentBlocks(IEnumerable<ProjectContentBlockRequestDto>? blocks) =>
        blocks?.Select(block => new ProjectContentBlock
        {
            Type = block.Type,
            Text = block.Text?.Trim(),
            Url = block.Url?.Trim(),
            Caption = block.Caption?.Trim(),
            SortOrder = block.SortOrder
        }).ToList() ?? new List<ProjectContentBlock>();

    private static List<ProjectCollaboratorRequestDto> GetCollaborators(
        IEnumerable<ProjectCollaboratorRequestDto>? collaborators,
        IEnumerable<string>? collaboratorIds) => collaborators?.ToList() ??
        (collaboratorIds ?? []).Select(id => new ProjectCollaboratorRequestDto { Id = id }).ToList();

    public async Task<AiReviewResult> GenerateAiReviewAsync(int id)
    {
        var project = await _projectRepository.GetByIdAsync(id);

        if(project == null) 
            return new AiReviewResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };
        
        return await _aiReviewService.ReviewProjectAsync(project);
    }
}
