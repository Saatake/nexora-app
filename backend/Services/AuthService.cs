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

        var htmlMessage = $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;'>
            <h2 style='color: #2F80ED; text-align: center; margin-bottom: 20px;'>Bem-vindo ao Ágora!</h2>
            <p style='color: #333333; font-size: 16px; line-height: 1.5;'>Olá <strong>{user.Name}</strong>,</p>
            <p style='color: #333333; font-size: 16px; line-height: 1.5;'>Que bom ter você com a gente! Para começar a acessar os projetos e relatórios da plataforma, precisamos apenas que você confirme seu e-mail clicando no botão abaixo:</p>
            <div style='text-align: center; margin: 30px 0;'>
                <a href='{link}' style='background-color: #2F80ED; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;'>Confirmar minha conta</a>
            </div>
            <hr style='border: none; border-top: 1px solid #eaeaea; margin: 30px 0;' />
            <p style='color: #777777; font-size: 12px; text-align: center;'>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br><a href='{link}' style='color: #2F80ED; word-break: break-all;'>{link}</a></p>
        </div>";

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