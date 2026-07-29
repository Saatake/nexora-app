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
        // GROUP BY e AVG rodam no banco — só os top N chegam na memória
        var results = await _context.Evaluations
            .Where(e => !e.Project!.IsPrivate)
            .GroupBy(e => e.ProjectId)
            .Select(g => new
            {
                ProjectId = g.Key,
                Average = g.Average(e => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0)
            })
            .OrderByDescending(x => x.Average)
            .Take(count)
            .Join(
                _context.Projects.Include(p => p.User),
                x => x.ProjectId,
                p => p.Id,
                (x, p) => new RankingProjectDto
                {
                    ProjectId = p.Id,
                    Title = p.Title,
                    AuthorName = p.User != null ? p.User.Name : "Anônimo",
                    AverageGrade = Math.Round(x.Average, 2),
                    ViewCount = p.ViewCount
                })
            .ToListAsync();

        for (int i = 0; i < results.Count; i++)
            results[i].Position = i + 1;

        return results;
    }

    public async Task<IEnumerable<RankingStudentDto>> GetTopStudentsAsync(int count = 5)
    {
        // agrupa avaliações por aluno no banco, traz só os top N
        var results = await _context.Evaluations
            .Where(e => !e.Project!.IsPrivate && e.Project.User!.RoleType == UserRole.Estudante)
            .GroupBy(e => e.Project!.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                AverageGrade = g.Average(e => (e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0),
                ProjectCount = g.Select(e => e.ProjectId).Distinct().Count()
            })
            .OrderByDescending(x => x.AverageGrade)
            .Take(count)
            .Join(
                _context.Users,
                x => x.UserId,
                u => u.Id,
                (x, u) => new RankingStudentDto
                {
                    StudentId = u.Id,
                    Name = u.Name,
                    Course = u.Course,
                    AverageGrade = Math.Round(x.AverageGrade, 2),
                    ProjectCount = x.ProjectCount,
                    ProfilePictureUrl = u.PhotoUrl ?? string.Empty
                })
            .ToListAsync();

        for (int i = 0; i < results.Count; i++)
            results[i].Position = i + 1;

        return results;
    }

    public async Task<GeneralStatsDto> GetGeneralStatsAsync()
    {
        var totalProjects = await _context.Projects.CountAsync(p => !p.IsPrivate);
        var totalViews = await _context.Projects.Where(p => !p.IsPrivate).SumAsync(p => p.ViewCount);
        var totalStudents = await _context.Users.CountAsync(u => u.RoleType == UserRole.Estudante);

        // AVG direto no banco, sem carregar todas as avaliações na memória
        var generalAverage = await _context.Evaluations
            .Where(e => e.Project != null && !e.Project.IsPrivate)
            .AverageAsync(e => (double?)((e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0)) ?? 0;

        return new GeneralStatsDto
        {
            TotalProjects = totalProjects,
            GeneralAverage = Math.Round(generalAverage, 2),
            TotalViews = totalViews,
            TotalStudents = totalStudents
        };
    }
}
