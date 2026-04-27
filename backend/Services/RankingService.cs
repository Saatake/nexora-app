using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Services;

public class RankingService : IRankingService
{
    private readonly AppDbContext _context;

    public RankingService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RankingProjectDto>> GetTopProjectsAsync(int count = 10)
    {
        var projects = await _context.Projects
            .Include(p => p.User)
            .Include(p => p.Evaluations)
            .Where(p => p.Evaluations.Any())
            .ToListAsync();

        return projects
            .Select(p => new
            {
                Project = p,
                Average = p.Evaluations.Average(e => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0)
            })
            .OrderByDescending(x => x.Average)
            .Take(count)
            .Select((x, index) => new RankingProjectDto
            {
                Position = index + 1,
                ProjectId = x.Project.Id,
                Title = x.Project.Title,
                AuthorName = x.Project.User?.Name ?? "Anônimo",
                AverageGrade = Math.Round(x.Average, 2),
                ViewCount = x.Project.ViewCount
            })
            .ToList();
    }

    public async Task<IEnumerable<RankingStudentDto>> GetTopStudentsAsync(int count = 5)
    {
        var projects = await _context.Projects
            .Include(p => p.User)
            .Include(p => p.Evaluations)
            .Where(p => p.Evaluations.Any() && p.User != null && p.User.RoleType == UserRole.Estudante)
            .ToListAsync();

        return projects
            .GroupBy(p => p.UserId)
            .Select(g =>
            {
                var user = g.First().User!;
                var allEvals = g.SelectMany(p => p.Evaluations);
                return new RankingStudentDto
                {
                    StudentId = user.Id,
                    Name = user.Name,
                    Course = user.Course,
                    AverageGrade = Math.Round(allEvals.Average(e => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0), 2),
                    ProjectCount = g.Count()
                };
            })
            .OrderByDescending(s => s.AverageGrade)
            .Take(count)
            .Select((s, index) => { s.Position = index + 1; return s; })
            .ToList();
    }

    public async Task<GeneralStatsDto> GetGeneralStatsAsync()
    {
        var totalProjects = await _context.Projects.CountAsync();
        var totalViews = await _context.Projects.SumAsync(p => p.ViewCount);
        var totalStudents = await _context.Users.CountAsync(u => u.RoleType == UserRole.Estudante);

        var evaluations = await _context.Evaluations.ToListAsync();
        var generalAverage = evaluations.Any()
            ? Math.Round(evaluations.Average(e => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0), 2)
            : 0;

        return new GeneralStatsDto
        {
            TotalProjects = totalProjects,
            GeneralAverage = generalAverage,
            TotalViews = totalViews,
            TotalStudents = totalStudents
        };
    }
}
