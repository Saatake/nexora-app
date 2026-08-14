using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Results;

namespace Nexora.Api.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public UserService(UserManager<ApplicationUser> userManager, AppDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<UserResult> GetProfileAsync(string userId)
    {
        var user = await _context.Users
            .Include(u => u.TeachingAreas)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return new UserResult { Succeeded = false, IsNotFound = true, Message = "usuário não encontrado." };

        return new UserResult { Succeeded = true, Data = MapToDto(user) };
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
        user.Formation = model.Formation;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return new UserResult { Succeeded = false, Errors = result.Errors.Select(e => e.Description) };

        return new UserResult { Succeeded = true, Message = "perfil atualizado com sucesso!" };
    }

    public async Task<UserResult> UpdateTeachingAreasAsync(string userId, UpdateTeachingAreasRequestDto model)
    {
        var user = await _context.Users
            .Include(u => u.TeachingAreas)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return new UserResult { Succeeded = false, IsNotFound = true, Message = "usuário não encontrado." };

        _context.UserTeachingAreas.RemoveRange(user.TeachingAreas);

        foreach (var area in model.Areas.Distinct())
            user.TeachingAreas.Add(new UserTeachingArea { UserId = userId, Area = area });

        await _context.SaveChangesAsync();

        return new UserResult { Succeeded = true, Message = "áreas de ensino atualizadas com sucesso!" };
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

    public async Task<IEnumerable<UserResponseDto>> SearchUsersAsync(string? search, int page, int pageSize)
    {
        var query = _context.Users
            .Include(u => u.TeachingAreas)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(u => u.Name.ToLower().Contains(term)
                                  || (u.Course != null && u.Course.ToLower().Contains(term)));
        }

        var users = await query
            .OrderBy(u => u.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return users.Select(MapToDto);
    }

    private static UserResponseDto MapToDto(ApplicationUser u) => new()
    {
        Id = u.Id,
        Email = u.Email!,
        Name = u.Name,
        Course = u.Course ?? string.Empty,
        Bio = u.Bio ?? string.Empty,
        PhotoUrl = u.PhotoUrl,
        Interests = u.Interests,
        RoleType = u.RoleType.ToString(),
        Formation = u.Formation,
        TeachingAreas = u.TeachingAreas.Select(ta => ta.Area.ToString()).ToList()
    };
}