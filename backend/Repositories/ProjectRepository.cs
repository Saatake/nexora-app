using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Services;

namespace Nexora.Api.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _context;

    public ProjectRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Project> CreateAsync(Project project)
    {
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return project;
    }

    public async Task<IEnumerable<Project>> GetAllAsync()
    {
        return await _context.Projects
        .Include(p => p.User)
        .Include(p => p.Collaborators).ThenInclude(c => c.User)
        .Include(p => p.Badges).ThenInclude(b => b.Professor)
        .Where(p => !p.IsPrivate)
        .OrderByDescending(p => p.CreatedAt)
        .ToListAsync();
    }

    public async Task<(IEnumerable<Project> Items, int TotalCount)> GetFilteredAsync(
        string? search, ProjectCategory? category, ThematicArea? thematicArea,
        double? minGrade, string? sort, int page, int pageSize)
    {
        var query = _context.Projects
            .Include(p => p.User)
            .Include(p => p.Evaluations).ThenInclude(e => e.Professor)
            .Include(p => p.Collaborators).ThenInclude(c => c.User)
            .Include(p => p.Badges).ThenInclude(b => b.Professor)
            .Where(p => !p.IsPrivate)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            var tagSearch = ProjectTagCatalog.TryCanonicalize(search, out var canonicalTag)
                ? canonicalTag.ToLower()
                : searchLower;
            query = query.Where(p =>
                p.Title.ToLower().Contains(searchLower) ||
                p.Description.ToLower().Contains(searchLower) ||
                (p.Tags != null && p.Tags.ToLower().Contains(searchLower)) ||
                (p.Tags != null && p.Tags.ToLower().Contains(tagSearch)));
        }

        if (category.HasValue)
            query = query.Where(p => p.Category == category.Value);

        if (thematicArea.HasValue)
            query = query.Where(p => p.ThematicArea == thematicArea.Value);

        if (minGrade.HasValue)
            query = query.Where(p => p.Evaluations.Any() && p.Evaluations.Average(e => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0) >= minGrade.Value);

        query = sort?.ToLower() switch
        {
            "views" => query.OrderByDescending(p => p.ViewCount),
            "downloads" => query.OrderByDescending(p => p.DownloadCount),
            "oldest" => query.OrderBy(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (items, totalCount);
    }

    public async Task<(IEnumerable<Project> Items, int TotalCount)> GetByUserAsync(string userId, ProjectCategory? category, int page, int pageSize)
    {
        var query = _context.Projects
            .Include(p => p.User)
            .Include(p => p.Evaluations).ThenInclude(e => e.Professor)
            .Include(p => p.Collaborators).ThenInclude(c => c.User)
            .Include(p => p.Badges).ThenInclude(b => b.Professor)
            .Where(p => p.UserId == userId)
            .AsQueryable();

        if (category.HasValue)
            query = query.Where(p => p.Category == category.Value);

        query = query.OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (items, totalCount);
    }

    public async Task<(IEnumerable<Project> Items, int TotalCount)> GetCollaboratedAsync(string userId, int page, int pageSize)
    {
        var query = _context.Projects
            .Where(project => project.Collaborators.Any(collaborator => collaborator.UserId == userId))
            .Include(p => p.User)
            .Include(p => p.Evaluations).ThenInclude(e => e.Professor)
            .Include(p => p.Collaborators).ThenInclude(c => c.User)
            .Include(p => p.Badges).ThenInclude(b => b.Professor)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (items, totalCount);
    }

    public async Task<Project?> GetByIdAsync(int id)
    {
        return await _context.Projects
            .Include(p => p.User)
            .Include(p => p.Evaluations).ThenInclude(e => e.Professor)
            .Include(p => p.Collaborators).ThenInclude(c => c.User)
            .Include(p => p.Badges).ThenInclude(b => b.Professor)
            .Include(p => p.ContentBlocks)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task UpdateAsync(Project project)
    {
        _context.Projects.Update(project);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Project project)
    {
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
    }

    public async Task SetCollaboratorsAsync(int projectId, List<ProjectCollaboratorRequestDto> collaborators)
    {
        var existing = await _context.ProjectCollaborators
            .Where(pc => pc.ProjectId == projectId)
            .ToListAsync();

        _context.ProjectCollaborators.RemoveRange(existing);

        foreach (var collaborator in collaborators
            .Where(collaborator => !string.IsNullOrWhiteSpace(collaborator.Id))
            .GroupBy(collaborator => collaborator.Id, StringComparer.Ordinal)
            .Select(group => group.First()))
        {
            _context.ProjectCollaborators.Add(new ProjectCollaborator
            {
                ProjectId = projectId,
                UserId = collaborator.Id,
                Contribution = collaborator.Contribution?.Trim(),
                Role = collaborator.Role?.Trim()
            });
        }

        await _context.SaveChangesAsync();
    }
}
