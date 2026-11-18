using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Interfaces;
using System.Security.Claims;

namespace Nexora.Api.Controllers;

[Route("api/projects/{projectId:guid}/comments")]
[ApiController]
public class CommentController : ControllerBase
{
    private readonly ICommentService _commentService;
    private readonly IProjectRepository _projectRepository;

    public CommentController(ICommentService commentService, IProjectRepository projectRepository)
    {
        _commentService = commentService;
        _projectRepository = projectRepository;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetComments(Guid projectId)
    {
        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(projectId);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var comments = await _commentService.GetByProjectIdAsync(internalId.Value);
        return Ok(comments);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateCommentRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(projectId);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var comment = await _commentService.CreateAsync(internalId.Value, request, userId);
        return Created($"/api/projects/{projectId}/comments/{comment.Id}", comment);
    }
}
