using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(string userId)
    {
        var userProjects = _context.Projects.Where(p => p.UserId == userId);

        var projectCount = await userProjects.CountAsync();
        var totalViews = await userProjects.SumAsync(p => p.ViewCount);
        var pendingApproval = await userProjects.CountAsync(p => !p.IsApproved);

        var evaluations = await _context.Evaluations
            .Where(e => userProjects.Select(p => p.Id).Contains(e.ProjectId))
            .ToListAsync();

        var averageGrade = evaluations.Any()
            ? Math.Round(evaluations.Average(e => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0), 2)
            : 0;

        return new DashboardStatsDto
        {
            ProjectCount = projectCount,
            AverageGrade = averageGrade,
            TotalViews = totalViews,
            PendingApproval = pendingApproval
        };
    }

    public async Task<DashboardChartsDto> GetChartsAsync(string userId)
    {
        var userProjectIds = await _context.Projects
            .Where(p => p.UserId == userId)
            .Select(p => p.Id)
            .ToListAsync();

        var evaluations = await _context.Evaluations
            .Where(e => userProjectIds.Contains(e.ProjectId))
            .OrderBy(e => e.CreatedAt)
            .ToListAsync();

        // evolução de notas por mês
        var gradeEvolution = evaluations
            .GroupBy(e => new { e.CreatedAt.Year, e.CreatedAt.Month })
            .Select(g => new GradeEvolutionDto
            {
                Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                Average = Math.Round(g.Average(e => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0), 2)
            })
            .ToList();

        // média por critério
        var criteriaAverage = new CriteriaAverageDto();
        if (evaluations.Any())
        {
            criteriaAverage.Relevance = Math.Round(evaluations.Average(e => e.Relevance), 2);
            criteriaAverage.Quality = Math.Round(evaluations.Average(e => e.Quality), 2);
            criteriaAverage.Methodology = Math.Round(evaluations.Average(e => e.Methodology), 2);
            criteriaAverage.Presentation = Math.Round(evaluations.Average(e => e.Presentation), 2);
            criteriaAverage.Innovation = Math.Round(evaluations.Average(e => e.Innovation), 2);
        }

        return new DashboardChartsDto
        {
            GradeEvolution = gradeEvolution,
            CriteriaAverage = criteriaAverage
        };
    }
}
