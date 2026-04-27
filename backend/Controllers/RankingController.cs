using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Controllers;

[Route("api")]
[ApiController]
public class RankingController : ControllerBase
{
    private readonly IRankingService _rankingService;

    public RankingController(IRankingService rankingService)
    {
        _rankingService = rankingService;
    }

    [HttpGet("ranking/projects")]
    public async Task<IActionResult> GetTopProjects()
    {
        var result = await _rankingService.GetTopProjectsAsync();
        return Ok(result);
    }

    [HttpGet("ranking/students")]
    public async Task<IActionResult> GetTopStudents()
    {
        var result = await _rankingService.GetTopStudentsAsync();
        return Ok(result);
    }

    [HttpGet("stats/general")]
    public async Task<IActionResult> GetGeneralStats()
    {
        var result = await _rankingService.GetGeneralStatsAsync();
        return Ok(result);
    }
}
