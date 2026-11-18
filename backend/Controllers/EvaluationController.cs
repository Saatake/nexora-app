using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Interfaces;
using System.Security.Claims;

namespace Nexora.Api.Controllers;

[Route("api/projects/{projectId:guid}/evaluations")]
[ApiController]
public class EvaluationController : ControllerBase
{
    private readonly IEvaluationService _evaluationService;
    private readonly IProjectRepository _projectRepository;

    public EvaluationController(IEvaluationService evaluationService, IProjectRepository projectRepository)
    {
        _evaluationService = evaluationService;
        _projectRepository = projectRepository;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetEvaluations(Guid projectId)
    {
        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(projectId);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var evaluations = await _evaluationService.GetByProjectIdAsync(internalId.Value);
        return Ok(evaluations);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateEvaluationRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(projectId);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var result = await _evaluationService.CreateAsync(internalId.Value, request, userId);

        if (!result.Succeeded)
        {
            if (result.IsForbidden) return StatusCode(403, new { result.Message });
            return BadRequest(new { result.Message });
        }

        return Ok(new { result.Message });
    }
}
