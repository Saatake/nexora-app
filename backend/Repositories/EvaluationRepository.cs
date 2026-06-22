using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;

namespace Nexora.Api.Repositories;

public class EvaluationRepository : IEvaluationRepository
{
    private readonly AppDbContext _context;

    public EvaluationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Evaluation> CreateAsync(Evaluation evaluation)
    {
        _context.Evaluations.Add(evaluation);
        await _context.SaveChangesAsync();

        await _context.Entry(evaluation).Reference(e => e.Professor).LoadAsync();
        return evaluation;
    }

    public async Task<IEnumerable<Evaluation>> GetByProjectIdAsync(int projectId)
    {
        return await _context.Evaluations
            .Include(e => e.Professor)
            .Where(e => e.ProjectId == projectId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> ProfessorAlreadyEvaluatedAsync(int projectId, string professorId)
    {
        return await _context.Evaluations.AnyAsync(e => e.ProjectId == projectId && e.ProfessorId == professorId);
    }
}
