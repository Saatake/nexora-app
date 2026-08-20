using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Enums;
using Nexora.Api.Models;
using Nexora.Api.Results;

namespace Nexora.Api.Services;

public class BadgeService
{
    private readonly AppDbContext _context;

    public BadgeService(AppDbContext context) => _context = context;

    public async Task<BadgeResult> AwardBadgeAsync(int projectId, string professorId, BadgeType badge)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
            return new BadgeResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        var already = await _context.ProjectBadges
            .AnyAsync(b => b.ProjectId == projectId && b.Badge == badge && b.ProfessorId == professorId);
        if (already)
            return new BadgeResult { Succeeded = false, Message = "Você já concedeu este badge a este projeto." };

        _context.ProjectBadges.Add(new ProjectBadge
        {
            ProjectId = projectId,
            ProfessorId = professorId,
            Badge = badge,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        return new BadgeResult { Succeeded = true, Message = "Badge concedido com sucesso." };
    }

    public async Task<BadgeResult> RemoveBadgeAsync(int projectId, string professorId, BadgeType badge)
    {
        var existing = await _context.ProjectBadges
            .FirstOrDefaultAsync(b => b.ProjectId == projectId && b.Badge == badge && b.ProfessorId == professorId);

        if (existing == null)
            return new BadgeResult { Succeeded = false, IsNotFound = true, Message = "Badge não encontrado." };

        _context.ProjectBadges.Remove(existing);
        await _context.SaveChangesAsync();

        return new BadgeResult { Succeeded = true, Message = "Badge removido." };
    }

    public async Task<List<ProjectBadgeDto>> GetBadgesForProjectAsync(int projectId)
    {
        var badges = await _context.ProjectBadges
            .Where(b => b.ProjectId == projectId)
            .Include(b => b.Professor)
            .OrderBy(b => b.Badge)
            .ThenBy(b => b.CreatedAt)
            .ToListAsync();

        return badges
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
            })
            .ToList();
    }
}
