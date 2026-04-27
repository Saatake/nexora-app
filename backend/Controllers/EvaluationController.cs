using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Interfaces;
using System.Security.Claims;

namespace Nexora.Api.Controllers;

[Route("api/projects/{projectId}/evaluations")]
[ApiController]
public class EvaluationController : ControllerBase
{
    private readonly IEvaluationService _evaluationService;

    public EvaluationController(IEvaluationService evaluationService)
    {
        _evaluationService = evaluationService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetEvaluations(int projectId)
    {
        var evaluations = await _evaluationService.GetByProjectIdAsync(projectId);
        return Ok(evaluations);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(int projectId, [FromBody] CreateEvaluationRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _evaluationService.CreateAsync(projectId, request, userId);

        if (!result.Succeeded)
        {
            if (result.IsForbidden) return StatusCode(403, new { result.Message });
            return BadRequest(new { result.Message });
        }

        return Ok(new { result.Message });
    }
}
