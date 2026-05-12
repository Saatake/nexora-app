using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Results;

namespace Nexora.Api.Interfaces;

public interface IUserService
{
    Task<UserResult> GetProfileAsync(string userId);
    Task<UserResult> UpdateProfileAsync(string userId, UpdateProfileRequestDto model);
    Task<UserResult> ChangePasswordAsync(string userId, ChangePasswordRequestDto model);
    Task<IEnumerable<UserResponseDto>> SearchUsersAsync(string? search, int page, int pageSize);
}