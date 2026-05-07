using Microsoft.AspNetCore.Identity;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Results;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;

namespace Nexora.Api.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;
    private readonly string _frontendUrl;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AuthService> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _emailService = emailService;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
    }

    public async Task<AuthResult> LoginAsync(LoginRequestDto model)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
                return Fail();

            if (!user.EmailConfirmed)
                return new AuthResult
                {
                    Succeeded = false,
                    IsUnauthorized = true,
                    Message = "email não confirmado. verifique sua caixa de entrada."
                };

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (!result.Succeeded)
                return Fail();

            var token = _tokenService.GenerateJwtToken(user);

            return new AuthResult
            {
                Succeeded = true,
                Token = token
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine("LOGIN ERROR: " + ex.Message);

            return new AuthResult
            {
                Succeeded = false,
                Message = "erro no login"
            };
        }
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequestDto model)
    {
        try
        {
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                Name = model.Name ?? "",
                Course = model.Course ?? "",
                Bio = model.Bio ?? "",
                RoleType = ParseRoleType(model.RoleType)
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return new AuthResult
                {
                    Succeeded = false,
                    Errors = result.Errors.Select(e => e.Description)
                };
            }

            var confirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = Uri.EscapeDataString(confirmationToken);
                        var frontendUrl = ResolveFrontendUrl();
                        var confirmationLink = $"{frontendUrl}/confirmar-email?email={Uri.EscapeDataString(user.Email!)}&token={encodedToken}";

                        var emailHtml = $@"<!DOCTYPE html>
<html lang='pt-br'>
<head>
    <meta charset='UTF-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <title>Confirme seu email</title>
</head>
<body style='margin:0;padding:0;background-color:#f3f4f6;font-family:Arial, Helvetica, sans-serif;'>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background-color:#f3f4f6;padding:32px 0;'>
        <tr>
            <td align='center'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:520px;background:#ffffff;border-radius:20px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;'>
                    <tr>
                        <td style='padding:32px 32px 8px;'>
                            <div style='display:inline-flex;align-items:center;gap:12px;'>
                                <div style='width:44px;height:44px;border-radius:12px;background:#4f46e5;color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;'>A</div>
                                <div style='font-size:22px;font-weight:700;color:#111827;'>Agora</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 32px 24px;'>
                            <h1 style='margin:16px 0 8px;font-size:24px;color:#111827;'>Confirme seu email</h1>
                            <p style='margin:0;color:#4b5563;font-size:15px;line-height:1.6;'>Ola, {user.Name}! Clique no botao abaixo para ativar sua conta e continuar no Agora.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 32px 32px;'>
                            <a href='{confirmationLink}' style='display:inline-block;padding:12px 20px;border-radius:12px;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;'>Confirmar email</a>
                            <p style='margin:20px 0 0;color:#6b7280;font-size:13px;line-height:1.6;'>Se o botao nao funcionar, copie e cole este link no navegador:</p>
                            <p style='margin:8px 0 0;word-break:break-all;'>
                                <a href='{confirmationLink}' style='color:#4f46e5;text-decoration:none;font-size:13px;'>{confirmationLink}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 32px 24px;'>
                            <p style='margin:0;color:#9ca3af;font-size:12px;line-height:1.6;'>Se voce nao solicitou este cadastro, ignore este email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

                        await _emailService.SendEmailAsync(
                                user.Email!,
                                "Confirme seu email - Agora",
                                emailHtml
                        );

            return new AuthResult
            {
                Succeeded = true,
                Message = "usuário criado com sucesso! verifique seu email para confirmar o cadastro."
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine("REGISTER ERROR: " + ex.Message);

            return new AuthResult
            {
                Succeeded = false,
                Message = "erro no registro"
            };
        }
    }

    public async Task<AuthResult> ConfirmEmailAsync(string email, string token)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
            return new AuthResult { Succeeded = false, Message = "usuário não encontrado." };

        var decodedToken = Uri.UnescapeDataString(token);
        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

        if (!result.Succeeded)
            return new AuthResult
            {
                Succeeded = false,
                Message = "token inválido ou expirado.",
                Errors = result.Errors.Select(e => e.Description)
            };

        return new AuthResult { Succeeded = true, Message = "email confirmado com sucesso!" };
    }

    public async Task<AuthResult> ForgotPasswordAsync(ForgotPasswordRequestDto model)
    {
        const string successMessage = "Se o e-mail estiver cadastrado, enviaremos um link de recuperação.";

        try
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null || !user.EmailConfirmed)
            {
                return new AuthResult
                {
                    Succeeded = true,
                    Message = successMessage
                };
            }

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = Uri.EscapeDataString(resetToken);
            var frontendUrl = ResolveFrontendUrl();
            var resetLink = $"{frontendUrl}/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={encodedToken}";

            var emailHtml = BuildResetPasswordEmail(user.Name, resetLink);

            await _emailService.SendEmailAsync(
                user.Email!,
                "Redefina sua senha - Agora",
                emailHtml
            );

            return new AuthResult
            {
                Succeeded = true,
                Message = successMessage
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FORGOT PASSWORD ERROR");

            return new AuthResult
            {
                Succeeded = false,
                Message = "erro ao enviar email de recuperação."
            };
        }
    }

    public async Task<AuthResult> ResetPasswordAsync(ResetPasswordRequestDto model)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
                return new AuthResult { Succeeded = false, Message = "usuário não encontrado." };

            var decodedToken = Uri.UnescapeDataString(model.Token);
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);

            if (!result.Succeeded)
                return new AuthResult
                {
                    Succeeded = false,
                    Message = "não foi possível redefinir a senha.",
                    Errors = result.Errors.Select(e => e.Description)
                };

            return new AuthResult
            {
                Succeeded = true,
                Message = "senha redefinida com sucesso!"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RESET PASSWORD ERROR");

            return new AuthResult
            {
                Succeeded = false,
                Message = "erro ao redefinir senha."
            };
        }
    }

    private static UserRole ParseRoleType(string? roleType)
    {
        if (Enum.TryParse<UserRole>(roleType, true, out var role))
            return role;

        return UserRole.Estudante;
    }

    private static AuthResult Fail()
    {
        return new AuthResult
        {
            Succeeded = false,
            IsUnauthorized = true,
            Message = "usuário ou senha inválidos."
        };
    }

        private static string BuildResetPasswordEmail(string name, string resetLink)
        {
                return $@"<!DOCTYPE html>
<html lang='pt-br'>
<head>
    <meta charset='UTF-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <title>Redefina sua senha</title>
</head>
<body style='margin:0;padding:0;background-color:#f3f4f6;font-family:Arial, Helvetica, sans-serif;'>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background-color:#f3f4f6;padding:32px 0;'>
        <tr>
            <td align='center'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:520px;background:#ffffff;border-radius:20px;box-shadow:0 20px 40px rgba(15,23,42,0.12);overflow:hidden;'>
                    <tr>
                        <td style='padding:32px 32px 8px;'>
                            <div style='display:inline-flex;align-items:center;gap:12px;'>
                                <div style='width:44px;height:44px;border-radius:12px;background:#4f46e5;color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;'>A</div>
                                <div style='font-size:22px;font-weight:700;color:#111827;'>Agora</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 32px 24px;'>
                            <h1 style='margin:16px 0 8px;font-size:24px;color:#111827;'>Redefina sua senha</h1>
                            <p style='margin:0;color:#4b5563;font-size:15px;line-height:1.6;'>Ola, {name}! Clique no botao abaixo para criar uma nova senha.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 32px 32px;'>
                            <a href='{resetLink}' style='display:inline-block;padding:12px 20px;border-radius:12px;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:600;'>Redefinir senha</a>
                            <p style='margin:20px 0 0;color:#6b7280;font-size:13px;line-height:1.6;'>Se o botao nao funcionar, copie e cole este link no navegador:</p>
                            <p style='margin:8px 0 0;word-break:break-all;'>
                                <a href='{resetLink}' style='color:#4f46e5;text-decoration:none;font-size:13px;'>{resetLink}</a>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding:0 32px 24px;'>
                            <p style='margin:0;color:#9ca3af;font-size:12px;line-height:1.6;'>Se voce nao solicitou esta troca, ignore este email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
        }

    private string ResolveFrontendUrl()
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request == null)
            return _frontendUrl.TrimEnd('/');

        var origin = request.Headers["Origin"].ToString();
        if (!string.IsNullOrWhiteSpace(origin) && Uri.TryCreate(origin, UriKind.Absolute, out var originUri))
            return originUri.GetLeftPart(UriPartial.Authority).TrimEnd('/');

        var referer = request.Headers["Referer"].ToString();
        if (!string.IsNullOrWhiteSpace(referer) && Uri.TryCreate(referer, UriKind.Absolute, out var refererUri))
            return refererUri.GetLeftPart(UriPartial.Authority).TrimEnd('/');

        return _frontendUrl.TrimEnd('/');
    }
}