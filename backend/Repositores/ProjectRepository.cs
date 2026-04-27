using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
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
        // retorna os projetos
        return await _context.Projects.Include(p => p.User).OrderByDescending(p => p.CreatedAt).ToListAsync();
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