using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using System.Security.Claims;

namespace Nexora.Api.Controllers;

[Route("api/projects")]
[ApiController]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly UserManager<ApplicationUser> _userManager;

    public ProjectController(IProjectService projectService, UserManager<ApplicationUser> userManager)
    {
        _projectService = projectService;
        _userManager = userManager;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user?.RoleType == UserRole.Professor)
            return StatusCode(403, new { message = "professores não podem publicar projetos." });

        var result = await _projectService.CreateProjectAsync(request, userId);
        return Ok(result);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetFeed(
        [FromQuery] string? search, [FromQuery] ProjectCategory? category,
        [FromQuery] ThematicArea? thematicArea, [FromQuery] double? minGrade,
        [FromQuery] string? sort, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var feed = await _projectService.GetFeedAsync(search, category, thematicArea, minGrade, sort, page, pageSize);
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _projectService.GetDownloadAsync(id, userId);
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