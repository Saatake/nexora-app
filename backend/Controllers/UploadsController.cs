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
    public async Task<IActionResult> UploadProjectFile([FromForm] IFormFile file)
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
}
