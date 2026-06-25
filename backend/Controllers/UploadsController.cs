using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Interfaces;
using System.Security.Claims;

namespace Nexora.Api.Controllers;

[Route("api/uploads")]
[ApiController]
[Authorize]
public class UploadsController : ControllerBase
{
    private readonly IStorageService _storageService;

    public UploadsController(IStorageService storageService)
    {
        _storageService = storageService;
    }

    [HttpPost("project-file")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> UploadProjectFile(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest(new { message = "Arquivo vazio." });
        if (file.Length > 20_000_000) return BadRequest(new { message = "Arquivo acima de 20mb." });
        
        if (!string.Equals(Path.GetExtension(file.FileName), ".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Somente aceitos arquivos pdf." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anon";
        var url = await _storageService.UploadFileAsync(file, userId, "project"); 

        return Ok(new { url, fileName = file.FileName });
    }

    [HttpPost("profile-photo")]
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
    {
        var validationError = ValidateImageInput(file);
        if (validationError != null) return validationError; 

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anon";
        var url = await _storageService.UploadFileAsync(file, userId, "profile");

        return Ok(new { url, fileName = file.FileName });
    }

    [HttpPost("project-cover")]
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> UploadProjectCover(IFormFile file)
    {
        var validationError = ValidateImageInput(file);
        if (validationError != null) return validationError; 

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anon";
        var url = await _storageService.UploadFileAsync(file, userId, "cover");

        return Ok(new { url, fileName = file.FileName });
    }

    private IActionResult? ValidateImageInput(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest(new { message = "Arquivo vazio." });
        if (file.Length > 5_000_000) return BadRequest(new { message = "Arquivo acima de 5mb." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!new[] { ".jpg", ".jpeg", ".png", ".webp" }.Contains(ext))
        {
            return BadRequest(new { message = "Envie uma imagem (jpg, png ou webp)." });
        }
        return null;
    }
}