using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IWebHostEnvironment _env;

    public AuthController(IAuthService authService, IWebHostEnvironment env)
    {
        _authService = authService;
        _env = env;
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto model)
    {
        var result = await _authService.LoginAsync(model);

        if (!result.Succeeded)
            return result.IsUnauthorized
                ? Unauthorized(new { result.Message })
                : BadRequest(new { result.Errors });

        var isSecure = !_env.IsDevelopment();
        Response.Cookies.Append("jwt", result.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = isSecure,
            SameSite = isSecure ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return Ok();
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var isSecure = !_env.IsDevelopment();
        Response.Cookies.Delete("jwt", new CookieOptions
        {
            HttpOnly = true,
            Secure = isSecure,
            SameSite = isSecure ? SameSiteMode.None : SameSiteMode.Lax
        });

        return Ok();
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto model)
    {
        var result = await _authService.RegisterAsync(model);

        if (!result.Succeeded)
            return BadRequest(new { result.Errors, result.Message });

        return Ok(new { result.Message });
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string email, [FromQuery] string token)
    {
        var result = await _authService.ConfirmEmailAsync(email, token);

        if (!result.Succeeded)
            return BadRequest(new { result.Message });

        return Ok(new { result.Message });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto model)
    {
        var result = await _authService.ForgotPasswordAsync(model);
        return Ok(new { result.Message });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto model)
    {
        var result = await _authService.ResetPasswordAsync(model);

        if (!result.Succeeded)
            return BadRequest(new { result.Errors, result.Message });

        return Ok(new { result.Message });
    }
}