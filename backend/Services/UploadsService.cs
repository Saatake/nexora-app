using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Services;

public class StorageService : IStorageService
{
    private readonly IConfiguration _configuration;

    public StorageService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string userId, string filePrefix)
    {
        var connectionString = _configuration    ["Storage:ConnectionString"];

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Storage:ConnectionString não configurado.");

        var containerName = _configuration["Storage:Container"] ?? "projects";
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var blobFileName = $"{filePrefix}--{Guid.NewGuid():N}{extension}";
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