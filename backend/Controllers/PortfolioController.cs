using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Models;
using Nexora.Api.Interfaces;
using Microsoft.AspNetCore.RateLimiting;

namespace Nexora.Api.Controllers;

[ApiController]
[Route("api/portfolios")]
public class PortfolioController(AppDbContext db, IPortfolioAiDraftService portfolioAiDraftService, ILogger<PortfolioController> logger) : ControllerBase
{
    [Authorize]
    [EnableRateLimiting("auth")]
    [HttpPost("me/ai-draft")]
    public async Task<ActionResult<PortfolioAiDraftDto>> GenerateDraft([FromBody] PortfolioAiDraftRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var projectIds = request.ProjectIds.Distinct().ToList();
        if (projectIds.Count is < 1 or > 12) return BadRequest(new { message = "Escolha de 1 a 12 projetos para gerar o rascunho." });

        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();
        var projects = await db.Projects.Where(p => projectIds.Contains(p.Id) && p.UserId == userId).ToListAsync();
        if (projects.Count != projectIds.Count) return BadRequest(new { message = "Um ou mais projetos não pertencem à sua conta." });

        try
        {
            return Ok(await portfolioAiDraftService.GenerateAsync(user, projects));
        }
        catch (InvalidOperationException ex)
        {
            logger.LogWarning("Não foi possível gerar rascunho de portfólio para {UserId}: {Reason}", userId, ex.Message);
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Falha ao gerar rascunho de portfólio para {UserId}", userId);
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "Não foi possível gerar o rascunho agora. Tente novamente em alguns instantes." });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<PortfolioResponseDto>> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        var portfolio = await db.Portfolios
            .Include(p => p.User)
            .Include(p => p.Projects).ThenInclude(p => p.Project)
            .FirstOrDefaultAsync(p => p.UserId == userId);
        portfolio ??= new Portfolio { User = user, UserId = userId, Slug = MakeSlug(user.Name) };
        return Ok(ToResponse(portfolio, includePrivate: true));
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<PortfolioResponseDto>> SaveMine([FromBody] SavePortfolioRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        request.Slug = request.Slug.Trim().ToLowerInvariant();
        request.ProjectIds = request.ProjectIds.Distinct().ToList();
        if (request.ProjectIds.Count > 12) return BadRequest(new { message = "Escolha no máximo 12 projetos." });
        if (request.ProjectDrafts.Any(draft => !request.ProjectIds.Contains(draft.ProjectId)) || request.ProjectDrafts.Select(draft => draft.ProjectId).Distinct().Count() != request.ProjectDrafts.Count)
            return BadRequest(new { message = "As descrições enviadas devem corresponder aos projetos selecionados." });
        if (request.IsPublished && (string.IsNullOrWhiteSpace(request.Headline) || string.IsNullOrWhiteSpace(request.Bio)))
            return BadRequest(new { message = "Adicione um título e uma apresentação antes de publicar." });

        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();
        var selected = await db.Projects.Where(p => request.ProjectIds.Contains(p.Id) && p.UserId == userId).ToListAsync();
        if (selected.Count != request.ProjectIds.Count)
            return BadRequest(new { message = "Um ou mais projetos não pertencem à sua conta." });
        if (request.IsPublished && selected.Any(p => p.IsPrivate))
            return BadRequest(new { message = "Projetos privados precisam ser removidos antes de publicar." });

        var slugTaken = await db.Portfolios.AnyAsync(p => p.Slug == request.Slug && p.UserId != userId);
        if (slugTaken) return Conflict(new { message = "Esse endereço já está em uso." });

        var portfolio = await db.Portfolios.Include(p => p.Projects).FirstOrDefaultAsync(p => p.UserId == userId);
        if (portfolio is null)
        {
            portfolio = new Portfolio { UserId = userId };
            db.Portfolios.Add(portfolio);
        }

        portfolio.Slug = request.Slug;
        portfolio.Headline = request.Headline.Trim();
        portfolio.Bio = request.Bio.Trim();
        portfolio.Skills = request.Skills.Trim();
        portfolio.Theme = request.Theme;
        portfolio.IsPublished = request.IsPublished;
        portfolio.UpdatedAt = DateTime.UtcNow;
        var existingDrafts = portfolio.Projects.ToDictionary(link => link.ProjectId);
        db.PortfolioProjects.RemoveRange(portfolio.Projects);
        var draftsByProject = request.ProjectDrafts.ToDictionary(draft => draft.ProjectId);
        portfolio.Projects = selected.Select((project, index) => new PortfolioProject
        {
            Portfolio = portfolio,
            ProjectId = project.Id,
            SortOrder = index,
            PortfolioSummary = draftsByProject.TryGetValue(project.Id, out var draft) ? (string.IsNullOrWhiteSpace(draft.PortfolioSummary) ? null : draft.PortfolioSummary.Trim()) : existingDrafts.GetValueOrDefault(project.Id)?.PortfolioSummary,
            Contribution = draftsByProject.TryGetValue(project.Id, out draft) ? (string.IsNullOrWhiteSpace(draft.Contribution) ? null : draft.Contribution.Trim()) : existingDrafts.GetValueOrDefault(project.Id)?.Contribution,
            VisualSummary = draftsByProject.TryGetValue(project.Id, out draft) ? (string.IsNullOrWhiteSpace(draft.VisualSummary) ? null : draft.VisualSummary.Trim()) : existingDrafts.GetValueOrDefault(project.Id)?.VisualSummary
        }).ToList();

        await db.SaveChangesAsync();
        portfolio.User = user;
        foreach (var item in portfolio.Projects) item.Project = selected.First(p => p.Id == item.ProjectId);
        return Ok(ToResponse(portfolio, includePrivate: true));
    }

    [AllowAnonymous]
    [HttpGet("{slug}")]
    public async Task<ActionResult<PortfolioResponseDto>> GetPublic(string slug)
    {
        var portfolio = await db.Portfolios
            .Include(p => p.User)
            .Include(p => p.Projects).ThenInclude(p => p.Project)
            .FirstOrDefaultAsync(p => p.Slug == slug.ToLower() && p.IsPublished);
        if (portfolio?.User is null) return NotFound();
        return Ok(ToResponse(portfolio, includePrivate: false));
    }

    private static PortfolioResponseDto ToResponse(Portfolio portfolio, bool includePrivate)
    {
        var projects = portfolio.Projects
            .Where(link => link.Project is not null && (includePrivate || !link.Project.IsPrivate))
            .OrderBy(link => link.SortOrder)
            .Select(link => new PortfolioProjectResponseDto
            {
                Id = link.Project!.Id,
                Title = link.Project.Title,
                Summary = link.PortfolioSummary ?? link.Project.Summary ?? string.Empty,
                Contribution = link.Contribution,
                VisualSummary = link.VisualSummary,
                Description = link.Project.Description,
                Category = link.Project.Category.ToString(),
                ThematicArea = link.Project.ThematicArea.ToString(),
                ImageUrl = link.Project.ImageUrl,
                GithubLink = string.IsNullOrWhiteSpace(link.Project.GithubLink) ? null : link.Project.GithubLink,
                FileUrl = string.IsNullOrWhiteSpace(link.Project.FileUrl) ? null : link.Project.FileUrl
            }).ToList();

        return new PortfolioResponseDto
        {
            Name = portfolio.User?.Name ?? string.Empty,
            Course = portfolio.User?.Course ?? string.Empty,
            PhotoUrl = portfolio.User?.PhotoUrl,
            Slug = portfolio.Slug,
            Headline = portfolio.Headline,
            Bio = portfolio.Bio,
            Skills = portfolio.Skills.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
            Theme = portfolio.Theme,
            IsPublished = portfolio.IsPublished,
            Projects = projects
        };
    }

    private static string MakeSlug(string? name)
    {
        var slug = Regex.Replace((name ?? "meu-portfolio").ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');
        if (slug.Length < 3) slug = "meu-portfolio";
        return slug.Length > 40 ? slug[..40].TrimEnd('-') : slug;
    }
}
