using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Models;
using Nexora.Api.Dtos;
using System.Security.Claims;

namespace Nexora.Api.Controllers;

[Route("api/users")]
[ApiController]
[Authorize] // protege todas as rotas deste controller
public class UserController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        // extrai o id do usuario direto das claims do token jwt
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (userId == null)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return NotFound("usuário não encontrado.");

        // mapeia para o dto para nao enviar dados sensiveis
        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            Name = user.Name,
            Course = user.Course,
            Bio = user.Bio,
            RoleType = user.RoleType
        };

        return Ok(userDto);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDto model)
    {
        // pega o id pelo token jwt
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();

        // busca o cara no banco
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("usuário não encontrado.");

        // atualiza so os campos permitidos
        user.Name = model.Name;
        user.Course = model.Course;
        user.Bio = model.Bio;

        // salva no banco de dados
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { Message = "perfil atualizado com sucesso!" });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
    {
        // pega o id pelo token jwt
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();

        // busca o cara no banco
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("usuário não encontrado.");

        // o identity ja exige a senha atual e troca pela nova com hash
        var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { Message = "senha alterada com sucesso!" });
    }
}