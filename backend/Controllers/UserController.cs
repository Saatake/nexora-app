using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Interfaces;
using System.Security.Claims;

namespace Nexora.Api.Controllers;

[Route("api/users")]
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _userService.GetProfileAsync(userId);

        if (!result.Succeeded)
            return result.IsNotFound
                ? NotFound(new { result.Message })
                : BadRequest(new { result.Errors });

        return Ok(result.Data);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProfile(string id)
    {
        var result = await _userService.GetProfileAsync(id);

        if (!result.Succeeded)
            return result.IsNotFound
                ? NotFound(new { result.Message })
                : BadRequest(new { result.Errors });

        return Ok(result.Data);
    }

    [HttpGet]
    public async Task<IActionResult> SearchUsers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var users = await _userService.SearchUsersAsync(search, page, pageSize);
        return Ok(users);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequestDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _userService.UpdateProfileAsync(userId, model);

        if (!result.Succeeded)
            return result.IsNotFound
                ? NotFound(new { result.Message })
                : BadRequest(new { result.Errors });

        return Ok(new { result.Message });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _userService.ChangePasswordAsync(userId, model);

        if (!result.Succeeded)
            return BadRequest(new { result.Errors });

        return Ok(new { result.Message });
    }
}