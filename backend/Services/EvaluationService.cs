using Microsoft.AspNetCore.Identity;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Results;

namespace Nexora.Api.Services;

public class EvaluationService : IEvaluationService
{
    private readonly IEvaluationRepository _evaluationRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public EvaluationService(IEvaluationRepository evaluationRepository, UserManager<ApplicationUser> userManager)
    {
        _evaluationRepository = evaluationRepository;
        _userManager = userManager;
    }

    public async Task<ProjectResult> CreateAsync(int projectId, CreateEvaluationRequestDto model, string professorId)
    {
        var professor = await _userManager.FindByIdAsync(professorId);
        if (professor == null || professor.RoleType != UserRole.Professor)
            return new ProjectResult { Succeeded = false, IsForbidden = true, Message = "apenas professores podem avaliar projetos." };

        var alreadyEvaluated = await _evaluationRepository.ProfessorAlreadyEvaluatedAsync(projectId, professorId);
        if (alreadyEvaluated)
            return new ProjectResult { Succeeded = false, Message = "você já avaliou este projeto." };

        var evaluation = new Evaluation
        {
            ProjectId = projectId,
            ProfessorId = professorId,
            Relevance = model.Relevance,
            Quality = model.Quality,
            Methodology = model.Methodology,
            Presentation = model.Presentation,
            Innovation = model.Innovation,
            Feedback = model.Feedback,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _evaluationRepository.CreateAsync(evaluation);

        return new ProjectResult { Succeeded = true, Message = "avaliação registrada com sucesso!" };
    }

    public async Task<IEnumerable<EvaluationResponseDto>> GetByProjectIdAsync(int projectId)
    {
        var evaluations = await _evaluationRepository.GetByProjectIdAsync(projectId);
        return evaluations.Select(MapToDto);
    }

    private static EvaluationResponseDto MapToDto(Evaluation e)
    {
        return new EvaluationResponseDto
        {
            Id = e.Id,
            Relevance = e.Relevance,
            Quality = e.Quality,
            Methodology = e.Methodology,
            Presentation = e.Presentation,
            Innovation = e.Innovation,
            Average = Math.Round((e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0, 2),
            Feedback = e.Feedback,
            ProfessorName = e.Professor?.Name ?? "Professor",
            CreatedAt = e.CreatedAt
        };
    }
}
