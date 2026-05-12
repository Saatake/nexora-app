using Microsoft.AspNetCore.Identity;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Results;

namespace Nexora.Api.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserResult> GetProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return new UserResult { Succeeded = false, IsNotFound = true, Message = "usuário não encontrado." };

        var userDto = new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email!,
            Name = user.Name,
            Course = user.Course,
            Bio = user.Bio,
            PhotoUrl = user.PhotoUrl,
            Interests = user.Interests,
            RoleType = user.RoleType.ToString()
        };

        return new UserResult { Succeeded = true, Data = userDto };
    }

    public async Task<UserResult> UpdateProfileAsync(string userId, UpdateProfileRequestDto model)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return new UserResult { Succeeded = false, IsNotFound = true, Message = "usuário não encontrado." };

        user.Name = model.Name;
        user.Course = model.Course;
        user.Bio = model.Bio;
        user.PhotoUrl = model.PhotoUrl;
        user.Interests = model.Interests;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return new UserResult { Succeeded = false, Errors = result.Errors.Select(e => e.Description) };

        return new UserResult { Succeeded = true, Message = "perfil atualizado com sucesso!" };
    }

    public async Task<UserResult> ChangePasswordAsync(string userId, ChangePasswordRequestDto model)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return new UserResult { Succeeded = false, IsNotFound = true, Message = "usuário não encontrado." };

        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
        if (!result.Succeeded)
            return new UserResult { Succeeded = false, Errors = result.Errors.Select(e => e.Description) };

        return new UserResult { Succeeded = true, Message = "senha alterada com sucesso!" };
    }

    public Task<IEnumerable<UserResponseDto>> SearchUsersAsync(string? search, int page, int pageSize)
    {
        var query = _userManager.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(u => u.Name.ToLower().Contains(term)
                                  || (u.Course != null && u.Course.ToLower().Contains(term)));
        }

        var users = query
            .OrderBy(u => u.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Email = u.Email!,
                Name = u.Name,
                Course = u.Course ?? string.Empty,
                Bio = u.Bio ?? string.Empty,
                PhotoUrl = u.PhotoUrl,
                Interests = u.Interests,
                RoleType = u.RoleType.ToString()
            })
            .AsEnumerable();

        return Task.FromResult(users);
    }
}