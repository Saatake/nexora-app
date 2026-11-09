using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Services;

public class StorageService : IStorageService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public StorageService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string userId, string filePrefix)
    {
        var connectionString = _configuration    ["Storage:ConnectionString"];
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var blobFileName = $"{filePrefix}--{Guid.NewGuid():N}{extension}";

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            if (!_environment.IsDevelopment())
                throw new InvalidOperationException("Storage:ConnectionString não configurado.");

            var localUserId = Path.GetFileName(userId);
            var localRoot = Path.Combine(_environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"), "uploads", localUserId);
            Directory.CreateDirectory(localRoot);
            var localPath = Path.Combine(localRoot, blobFileName);
            await using (var localStream = new FileStream(localPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                await file.CopyToAsync(localStream);

            var baseUrl = (_configuration["LocalStorage:BaseUrl"] ?? "http://localhost:5000").TrimEnd('/');
            return $"{baseUrl}/uploads/{Uri.EscapeDataString(localUserId)}/{Uri.EscapeDataString(blobFileName)}";
        }

        var containerName = _configuration["Storage:Container"] ?? "projects";
        var blobPath = $"{userId}/{blobFileName}";

        var blobServiceClient = new BlobServiceClient(connectionString);
        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
        var blobClient = containerClient.GetBlobClient(blobPath);

        var headers = new BlobHttpHeaders { ContentType = GetContentType(extension) };

        await using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = headers });

        return blobClient.Uri.ToString();
    }

    private string GetContentType(string extension) => extension switch
    {
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".webp" => "image/webp",
        ".pdf" => "application/pdf",
        _ => "application/octet-stream"
    };
}
