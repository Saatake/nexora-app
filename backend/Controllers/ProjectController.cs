using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Enums;
using Nexora.Api.Helpers;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Services;
using System.Security.Claims;

namespace Nexora.Api.Controllers;

[Route("api/projects")]
[ApiController]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly IProjectRepository _projectRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly BadgeService _badgeService;
    private readonly IAiReviewService _aiReviewService;

    public ProjectController(
        IProjectService projectService,
        IProjectRepository projectRepository,
        UserManager<ApplicationUser> userManager,
        BadgeService badgeService,
        IAiReviewService aiReviewService)
    {
        _projectService = projectService;
        _projectRepository = projectRepository;
        _userManager = userManager;
        _badgeService = badgeService;
        _aiReviewService = aiReviewService;
    }

    [HttpPost("extract-from-pdf")]
    [Authorize]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> ExtractFromPdf(IFormFile file)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (!FeatureAccessHelper.HasAiAccess(user))
            return StatusCode(403, new { message = "Recurso exclusivo para contas habilitadas." });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Envie um arquivo PDF válido." });

        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(file.ContentType, "application/pdf", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Apenas arquivos PDF são suportados para extração automática." });
        }

        await using var ms = new MemoryStream();
        await file.CopyToAsync(ms);

        try
        {
            var extracted = await _aiReviewService.ExtractFromPdfAsync(ms.ToArray(), file.FileName);
            return Ok(extracted);
        }
        catch (Exception ex)
        {
            return StatusCode(502, new { message = $"Não foi possível extrair os dados do PDF com a IA: {ex.Message}" });
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var validationErrors = ProjectSubmissionValidator.Validate(request.ContentBlocks, request.SelectedTags);
        if (validationErrors.Count > 0)
            return BadRequest(new { message = validationErrors.First(), errors = validationErrors });

        var user = await _userManager.FindByIdAsync(userId);
        if (user?.RoleType == UserRole.Professor)
            return StatusCode(403, new { message = "professores não podem publicar projetos." });

        var result = await _projectService.CreateProjectAsync(request, userId);
        return Ok(result);
    }

    [HttpGet("tags")]
    [AllowAnonymous]
    public IActionResult GetTagCatalog() => Ok(ProjectTagCatalog.GetOptions());

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

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(id);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var result = await _projectService.GetByIdAsync(internalId.Value);

        if (!result.Succeeded)
            return result.IsNotFound ? NotFound(new { result.Message }) : BadRequest(new { result.Message });

        if (result.Data?.IsPrivate == true)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAllowed = !string.IsNullOrEmpty(currentUserId) && (
                result.Data.AuthorId == currentUserId ||
                result.Data.Collaborators.Any(c => c.Id == currentUserId)
            );
            if (!isAllowed)
                return NotFound(new { message = "Projeto não encontrado." });
        }

        return Ok(result.Data);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(id);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var validationErrors = ProjectSubmissionValidator.Validate(request.ContentBlocks, request.SelectedTags);
        if (validationErrors.Count > 0)
            return BadRequest(new { message = validationErrors.First(), errors = validationErrors });

        var result = await _projectService.UpdateAsync(internalId.Value, request, userId);

        if (!result.Succeeded)
        {
            if (result.IsNotFound) return NotFound(new { result.Message });
            if (result.IsForbidden) return Forbid();
            return BadRequest(new { result.Message });
        }

        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(id);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var result = await _projectService.DeleteAsync(internalId.Value, userId);

        if (!result.Succeeded)
        {
            if (result.IsNotFound) return NotFound(new { result.Message });
            if (result.IsForbidden) return Forbid();
            return BadRequest(new { result.Message });
        }

        return Ok(new { result.Message });
    }

    [HttpPost("{id:guid}/views")]
    [AllowAnonymous]
    public async Task<IActionResult> IncrementView(Guid id)
    {
        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(id);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _projectService.IncrementViewAsync(internalId.Value, userId);

        if (!result.Succeeded)
            return result.IsNotFound ? NotFound(new { result.Message }) : BadRequest(new { result.Message });

        return Ok(new { result.Message });
    }

    [HttpGet("{id:guid}/download")]
    [AllowAnonymous]
    public async Task<IActionResult> Download(Guid id)
    {
        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(id);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await _projectService.GetDownloadAsync(internalId.Value, userId);
        if (!result.Succeeded)
            return result.IsNotFound ? NotFound(new { result.Message }) : BadRequest(new { result.Message });

        return Ok(new { fileUrl = result.Message });
    }

    [HttpPost("{id:guid}/ai-review")]
    [Authorize]
    public async Task<IActionResult> AiReview(Guid id)
    {
        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(id);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var result = await _projectService.GenerateAiReviewAsync(internalId.Value);

        if (!result.Succeeded)
            return result.IsNotFound ? NotFound(new { result.Message }) : BadRequest(new { result.Message });

        return Ok(result.Data);
    }

    [HttpPost("{id:guid}/badges/{badge}")]
    [Authorize]
    public async Task<IActionResult> AwardBadge(Guid id, BadgeType badge)
    {
        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(id);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null || user.RoleType != UserRole.Professor)
            return Forbid();

        var result = await _badgeService.AwardBadgeAsync(internalId.Value, userId!, badge);
        if (!result.Succeeded)
            return result.IsNotFound ? NotFound(new { result.Message }) : Conflict(new { result.Message });

        return Ok(new { result.Message });
    }

    [HttpDelete("{id:guid}/badges/{badge}")]
    [Authorize]
    public async Task<IActionResult> RemoveBadge(Guid id, BadgeType badge)
    {
        var internalId = await _projectRepository.ResolveIdByPublicIdAsync(id);
        if (!internalId.HasValue)
            return NotFound(new { message = "Projeto não encontrado." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null || user.RoleType != UserRole.Professor)
            return Forbid();

        var result = await _badgeService.RemoveBadgeAsync(internalId.Value, userId!, badge);
        if (!result.Succeeded)
            return result.IsNotFound ? NotFound(new { result.Message }) : BadRequest(new { result.Message });

        return Ok(new { result.Message });
    }
}
