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
            TotalViews = totalViews
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

    public async Task<ProfessorDashboardDto> GetProfessorDashboardAsync(string professorId)
    {
        var areas = await _context.UserTeachingAreas
            .Where(ta => ta.UserId == professorId)
            .Select(ta => ta.Area)
            .ToListAsync();

        var evaluationsGiven = await _context.Evaluations
            .CountAsync(e => e.ProfessorId == professorId);

        var alreadyEvaluatedIds = await _context.Evaluations
            .Where(e => e.ProfessorId == professorId)
            .Select(e => e.ProjectId)
            .ToListAsync();

        // projetos nas áreas do professor que ele ainda não avaliou
        var pendingQuery = _context.Projects
            .Where(p => !p.IsPrivate && areas.Contains(p.ThematicArea) && !alreadyEvaluatedIds.Contains(p.Id))
            .Include(p => p.User)
            .Include(p => p.Evaluations)
            .OrderByDescending(p => p.CreatedAt);

        var pendingCount = await pendingQuery.CountAsync();
        var pendingProjects = await pendingQuery.Take(10).Select(p => new PendingProjectDto
        {
            Id = p.Id,
            Title = p.Title,
            Summary = p.Summary,
            ThematicAreaName = p.ThematicArea.ToString(),
            AuthorName = p.User != null ? p.User.Name : "",
            CommunityAverage = p.Evaluations.Any()
                ? Math.Round(p.Evaluations.Average(e => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0), 2)
                : null,
            CommunityCount = p.Evaluations.Count,
            ImageUrl = p.ImageUrl,
            CreatedAt = p.CreatedAt
        }).ToListAsync();

        // top 5 projetos mais bem avaliados
        var featuredProjects = await _context.Projects
            .Where(p => !p.IsPrivate && p.Evaluations.Any())
            .Include(p => p.User)
            .Include(p => p.Evaluations)
            .Include(p => p.Badges)
            .OrderByDescending(p => p.Evaluations.Average(e =>
                (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0))
            .Take(5)
            .Select(p => new FeaturedProjectDto
            {
                Id = p.Id,
                Title = p.Title,
                Summary = p.Summary,
                ThematicAreaName = p.ThematicArea.ToString(),
                AuthorName = p.User != null ? p.User.Name : "",
                AverageGrade = Math.Round(p.Evaluations.Average(e =>
                    (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0), 2),
                EvaluationCount = p.Evaluations.Count,
                ImageUrl = p.ImageUrl,
                Badges = p.Badges
                    .GroupBy(b => b.Badge)
                    .Select(g => new FeaturedBadgeDto { Badge = g.Key.ToString(), Count = g.Count() })
                    .ToList()
            })
            .ToListAsync();

        return new ProfessorDashboardDto
        {
            EvaluationsGiven = evaluationsGiven,
            AreasCount = areas.Count,
            PendingCount = pendingCount,
            PendingProjects = pendingProjects,
            FeaturedProjects = featuredProjects
        };
    }
}
