using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Interfaces;
using System.Security.Claims;

namespace Nexora.Api.Controllers;

[Route("api/projects")]
[ApiController]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpPost]
    [Authorize] // Precisa de token para publicar
    public async Task<IActionResult> Create([FromBody] CreateProjectRequestDto request)
    {
        // Pega o ID do usuário direto do token JWT
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _projectService.CreateProjectAsync(request, userId);
        return Ok(result);
    }

    [HttpGet]
    [AllowAnonymous] // Qualquer um pode ver os projetos (Feed)
    public async Task<IActionResult> GetFeed()
    {
        var feed = await _projectService.GetFeedAsync();
        return Ok(feed);
    }
}