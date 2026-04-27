using Nexora.Api.Models;

namespace Nexora.Api.Interfaces;

public interface IEvaluationRepository
{
    Task<Evaluation> CreateAsync(Evaluation evaluation);
    Task<IEnumerable<Evaluation>> GetByProjectIdAsync(int projectId);
    Task<bool> ProfessorAlreadyEvaluatedAsync(int projectId, string professorId);
}
