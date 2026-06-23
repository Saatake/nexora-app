using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Nexora.Api.Controllers;

[Route("api/uploads")]
[ApiController]
[Authorize]
public class UploadsController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public UploadsController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("project-file")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> UploadProjectFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "arquivo vazio." });

        if (file.Length > 20_000_000)
            return BadRequest(new { message = "arquivo acima de 20MB." });

        if (!string.Equals(Path.GetExtension(file.FileName), ".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "envie um arquivo pdf." });

        var connectionString = _configuration["Storage:ConnectionString"];
        if (string.IsNullOrWhiteSpace(connectionString))
            return StatusCode(500, new { message = "storage nao configurado." });

        var containerName = _configuration["Storage:Container"];
        if (string.IsNullOrWhiteSpace(containerName))
            containerName = "projects";

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anon";
        var blobFileName = $"{Guid.NewGuid():N}.pdf";
        var blobPath = $"{userId}/{blobFileName}";

        var blobServiceClient = new BlobServiceClient(connectionString);
        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobClient = containerClient.GetBlobClient(blobPath);
        var headers = new BlobHttpHeaders { ContentType = "application/pdf" };

        await using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = headers });

        return Ok(new { url = blobClient.Uri.ToString(), fileName = file.FileName });
    }

    [HttpPost("profile-photo")]
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "arquivo vazio." });

        if (file.Length > 5_000_000)
            return BadRequest(new { message = "arquivo acima de 5MB." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!new[] { ".jpg", ".jpeg", ".png", ".webp" }.Contains(extension))
            return BadRequest(new { message = "envie uma imagem (jpg, png ou webp)." });

        var connectionString = _configuration["Storage:ConnectionString"];
        if (string.IsNullOrWhiteSpace(connectionString))
            return StatusCode(500, new { message = "storage nao configurado." });

        var containerName = _configuration["Storage:Container"];
        if (string.IsNullOrWhiteSpace(containerName))
            containerName = "projects";

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anon";
        var blobFileName = $"profile-{Guid.NewGuid():N}{extension}";
        var blobPath = $"{userId}/{blobFileName}";

        var blobServiceClient = new BlobServiceClient(connectionString);
        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobClient = containerClient.GetBlobClient(blobPath);
        
        var contentType = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
        
        var headers = new BlobHttpHeaders { ContentType = contentType };

        await using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = headers });

        return Ok(new { url = blobClient.Uri.ToString(), fileName = file.FileName });
    }

    [HttpPost("project-cover")]
    [RequestSizeLimit(5_000_000)]
    public async Task<IActionResult> UploadProjectCover(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "arquivo vazio." });

        if (file.Length > 5_000_000)
            return BadRequest(new { message = "arquivo acima de 5MB." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!new[] { ".jpg", ".jpeg", ".png", ".webp" }.Contains(extension))
            return BadRequest(new { message = "envie uma imagem (jpg, png ou webp)." });

        var connectionString = _configuration["Storage:ConnectionString"];
        if (string.IsNullOrWhiteSpace(connectionString))
            return StatusCode(500, new { message = "storage nao configurado." });

        var containerName = _configuration["Storage:Container"] ?? "projects";

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anon";
        var blobFileName = $"cover-{Guid.NewGuid():N}{extension}";
        var blobPath = $"{userId}/{blobFileName}";

        var blobServiceClient = new BlobServiceClient(connectionString);
        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobClient = containerClient.GetBlobClient(blobPath);

        var contentType = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };

        var headers = new BlobHttpHeaders { ContentType = contentType };

        await using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = headers });

        return Ok(new { url = blobClient.Uri.ToString(), fileName = file.FileName });
    }
}
