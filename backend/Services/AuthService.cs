using Microsoft.AspNetCore.Identity;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Results;

namespace Nexora.Api.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        IEmailService emailService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _emailService = emailService;
    }

    public async Task<AuthResult> LoginAsync(LoginRequestDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return new AuthResult { Succeeded = false, IsUnauthorized = true, Message = "usuário ou senha inválidos." };

        var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
        if (!result.Succeeded)
            return new AuthResult { Succeeded = false, IsUnauthorized = true, Message = "usuário ou senha inválidos." };

        if (!await _userManager.IsEmailConfirmedAsync(user))
            return new AuthResult { Succeeded = false, IsUnauthorized = true, Message = "por favor, confirme seu e-mail antes de fazer login." };

        var token = _tokenService.GenerateJwtToken(user);
        return new AuthResult { Succeeded = true, Token = token };
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequestDto model)
    {
        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            Name = model.Name,
            Course = model.Course,
            Bio = model.Bio,
            RoleType = ParseRoleType(model.RoleType)
        };

        var result = await _userManager.CreateAsync(user, model.Password);
        if (!result.Succeeded)
            return new AuthResult { Succeeded = false, Errors = result.Errors.Select(e => e.Description) };

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var link = $"http://localhost:5173/confirmar-email?email={user.Email}&token={encodedToken}";

        var htmlMessage = $"<h3>bem-vindo ao ágora, {user.Name}!</h3><p>clique <a href='{link}'>aqui</a> para confirmar sua conta.</p>";
        await _emailService.SendEmailAsync(user.Email!, "confirme sua conta no ágora", htmlMessage);

        return new AuthResult { Succeeded = true, Message = "usuário criado! verifique seu e-mail." };
    }

    private static UserRole ParseRoleType(string roleType)
    {
        if (Enum.TryParse<UserRole>(roleType, true, out var parsedRole))
            return parsedRole;

        if (string.Equals(roleType, "student", StringComparison.OrdinalIgnoreCase))
            return UserRole.Estudante;

        return UserRole.Estudante;
    }

    public async Task<AuthResult> ConfirmEmailAsync(string email, string token)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return new AuthResult { Succeeded = false, Message = "usuário não encontrado." };

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (!result.Succeeded) return new AuthResult { Succeeded = false, Message = "token inválido ou expirado." };

        return new AuthResult { Succeeded = true, Message = "e-mail confirmado com sucesso!" };
    }

    public async Task<AuthResult> ForgotPasswordAsync(ForgotPasswordRequestDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) return new AuthResult { Succeeded = true, Message = "se o e-mail existir, enviaremos um link." };

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var link = $"http://localhost:5173/resetar-senha?email={user.Email}&token={encodedToken}";

        await _emailService.SendEmailAsync(user.Email!, "recuperação de senha", $"clique <a href='{link}'>aqui</a> para resetar sua senha.");
        return new AuthResult { Succeeded = true, Message = "link de recuperação enviado." };
    }

    public async Task<AuthResult> ResetPasswordAsync(ResetPasswordRequestDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) return new AuthResult { Succeeded = false, Message = "solicitação inválida." };

        var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
        if (!result.Succeeded) return new AuthResult { Succeeded = false, Errors = result.Errors.Select(e => e.Description) };

        return new AuthResult { Succeeded = true, Message = "senha atualizada!" };
    }
}