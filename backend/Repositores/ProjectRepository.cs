using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;

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
        return await _context.Projects.Include(p => p.User).OrderByDescending(p => p.CreatedAt).ToListAsync();
    }

    public async Task<(IEnumerable<Project> Items, int TotalCount)> GetFilteredAsync(string? search, ProjectCategory? category, int page, int pageSize)
    {
        var query = _context.Projects.Include(p => p.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(searchLower) || p.Description.ToLower().Contains(searchLower));
        }

        if (category.HasValue)
            query = query.Where(p => p.Category == category.Value);

        query = query.OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return (items, totalCount);
    }

    public async Task<Project?> GetByIdAsync(int id)
    {
        return await _context.Projects.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
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
}