using Microsoft.AspNetCore.Http;

namespace Nexora.Api.Interfaces;

public interface IStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string userId, string filePrefix);
}