using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Results;

namespace Nexora.Api.Interfaces;

public interface IEvaluationService
{
    Task<ProjectResult> CreateAsync(int projectId, CreateEvaluationRequestDto model, string professorId);
    Task<IEnumerable<EvaluationResponseDto>> GetByProjectIdAsync(int projectId);
}
