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
}