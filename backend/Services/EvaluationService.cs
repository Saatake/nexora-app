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
        if (professor == null)
            return new ProjectResult { Succeeded = false, IsForbidden = true, Message = "usuário não encontrado." };

        var alreadyEvaluated = await _evaluationRepository.ProfessorAlreadyEvaluatedAsync(projectId, professorId);
        if (alreadyEvaluated)
            return new ProjectResult { Succeeded = false, Message = "você já avaliou este projeto." };

        var isProfessor = professor.RoleType == UserRole.Professor;

        if (isProfessor && (model.TheoreticalFoundation is null || model.AcademicContribution is null || model.ExecutionFeasibility is null))
            return new ProjectResult { Succeeded = false, Message = "professores precisam preencher todos os critérios técnicos." };

        var evaluation = new Evaluation
        {
            ProjectId = projectId,
            ProfessorId = professorId,
            Relevance = model.Relevance,
            Quality = model.Quality,
            Methodology = model.Methodology,
            Presentation = model.Presentation,
            Innovation = model.Innovation,
            TheoreticalFoundation = isProfessor ? model.TheoreticalFoundation : null,
            AcademicContribution = isProfessor ? model.AcademicContribution : null,
            ExecutionFeasibility = isProfessor ? model.ExecutionFeasibility : null,
            Feedback = model.Feedback,
            CreatedAt = DateTime.UtcNow
        };

        await _evaluationRepository.CreateAsync(evaluation);

        return new ProjectResult { Succeeded = true, Message = "avaliação registrada com sucesso!" };
    }

    public async Task<IEnumerable<EvaluationResponseDto>> GetByProjectIdAsync(int projectId)
    {
        var evaluations = await _evaluationRepository.GetByProjectIdAsync(projectId);
        return evaluations.Select(MapToDto);
    }

    private static EvaluationResponseDto MapToDto(Evaluation e)
    {
        double? technicalAverage = null;
        if (e.TheoreticalFoundation.HasValue && e.AcademicContribution.HasValue && e.ExecutionFeasibility.HasValue)
        {
            technicalAverage = Math.Round(
                (e.TheoreticalFoundation.Value + e.AcademicContribution.Value + e.ExecutionFeasibility.Value) / 3.0, 2);
        }

        return new EvaluationResponseDto
        {
            Id = e.Id,
            Relevance = e.Relevance,
            Quality = e.Quality,
            Methodology = e.Methodology,
            Presentation = e.Presentation,
            Innovation = e.Innovation,
            Average = Math.Round((e.Relevance + e.Quality + e.Methodology + e.Presentation + e.Innovation) / 5.0, 2),
            TheoreticalFoundation = e.TheoreticalFoundation,
            AcademicContribution = e.AcademicContribution,
            ExecutionFeasibility = e.ExecutionFeasibility,
            TechnicalAverage = technicalAverage,
            Feedback = e.Feedback,
            EvaluatorId = e.ProfessorId,
            EvaluatorName = e.Professor?.Name ?? "Avaliador",
            EvaluatorRole = e.Professor?.RoleType.ToString() ?? string.Empty,
            CreatedAt = e.CreatedAt
        };
    }
}
