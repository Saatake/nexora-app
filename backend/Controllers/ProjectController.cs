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
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _projectService.CreateProjectAsync(request, userId);
        return Ok(result);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetFeed()
    {
        var feed = await _projectService.GetFeedAsync();
        return Ok(feed);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _projectService.GetByIdAsync(id);

        if (!result.Succeeded)
            return result.IsNotFound ? NotFound(new { result.Message }) : BadRequest(new { result.Message });

        return Ok(result.Data);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _projectService.UpdateAsync(id, request, userId);

        if (!result.Succeeded)
        {
            if (result.IsNotFound) return NotFound(new { result.Message });
            if (result.IsForbidden) return Forbid();
            return BadRequest(new { result.Message });
        }

        return Ok(result.Data);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _projectService.DeleteAsync(id, userId);

        if (!result.Succeeded)
        {
            if (result.IsNotFound) return NotFound(new { result.Message });
            if (result.IsForbidden) return Forbid();
            return BadRequest(new { result.Message });
        }

        return Ok(new { result.Message });
    }
}