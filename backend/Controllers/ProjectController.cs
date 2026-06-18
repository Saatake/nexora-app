using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Enums;
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
    public async Task<IActionResult> GetFeed(
        [FromQuery] string? search, [FromQuery] ProjectCategory? category,
        [FromQuery] string? course, [FromQuery] double? minGrade,
        [FromQuery] string? sort, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var feed = await _projectService.GetFeedAsync(search, category, course, minGrade, sort, page, pageSize);
        return Ok(feed);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProjects([FromQuery] ProjectCategory? type, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var result = await _projectService.GetMyProjectsAsync(userId, type, page, pageSize);
        return Ok(result);
    }

    [HttpGet("me/collaborations")]
    [Authorize]
    public async Task<IActionResult> GetMyCollaborations([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var result = await _projectService.GetCollaboratedProjectsAsync(userId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("user/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByUser(string userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var result = await _projectService.GetMyProjectsAsync(userId, null, page, pageSize);
        return Ok(result);
    }

    [HttpGet("user/{userId}/collaborations")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCollaborationsByUser(string userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var result = await _projectService.GetCollaboratedProjectsAsync(userId, page, pageSize);
        return Ok(result);
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

    [HttpPost("{id}/views")]
    [AllowAnonymous]
    public async Task<IActionResult> IncrementView(int id)
    {

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _projectService.IncrementViewAsync(id, userId);

        if (!result.Succeeded)
            return result.IsNotFound ? NotFound(new { result.Message }) : BadRequest(new { result.Message });

        return Ok(new { result.Message });
    }

    [HttpGet("{id}/download")]
    [AllowAnonymous]
    public async Task<IActionResult> Download(int id)
    {
        var result = await _projectService.GetDownloadAsync(id);
        if (!result.Succeeded)
            return result.IsNotFound ? NotFound(new { result.Message }) : BadRequest(new { result.Message });

        return Ok(new { fileUrl = result.Message });
    }

    [HttpPost("{id}/ai-review")]
    [Authorize]
    public async Task<IActionResult> AiReview(int id)
    {
        var result = await _projectService.GenerateAiReviewAsync(id);

        if (!result.Succeeded)
            return result.IsNotFound ? NotFound(new { result.Message }) : BadRequest(new { result.Message });

        return Ok(result.Data);
    }
}