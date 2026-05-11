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
<body style='margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,""Segoe UI"",Roboto,""Helvetica Neue"",Arial,sans-serif;'>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background-color:#f9fafb;padding:40px 16px;'>
        <tr>
            <td align='center'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:600px;background:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;border:1px solid #e5e7eb;'>
                    
                    <!-- Header com gradiente verde -->
                    <tr>
                        <td style='background:linear-gradient(135deg, #065f46 0%, #059669 100%);padding:32px 24px;text-align:center;'>
                            <h1 style='margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;'>Ágora</h1>
                            <p style='margin:8px 0 0;color:#d1fae5;font-size:14px;'>Plataforma Acadêmica</p>
                        </td>
                    </tr>
                    
                    <!-- Conteúdo -->
                    <tr>
                        <td style='padding:40px 32px;'>
                            <h2 style='margin:0 0 16px;font-size:24px;font-weight:600;color:#111827;'>Confirme seu email</h2>
                            <p style='margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;'>
                                Olá, <strong>{user.Name}</strong>! 👋
                            </p>
                            <p style='margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;'>
                                Bem-vindo à plataforma Ágora! Para começar a publicar seus projetos acadêmicos e colaborar com a comunidade, precisamos confirmar seu endereço de email.
                            </p>
                            
                            <!-- Botão -->
                            <table role='presentation' cellspacing='0' cellpadding='0' style='margin:32px 0;'>
                                <tr>
                                    <td style='border-radius:8px;background:#059669;'>
                                        <a href='{confirmationLink}' style='display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;'>
                                            Confirmar meu email
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Aviso de expiração -->
                            <div style='background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;margin:24px 0;border-radius:4px;'>
                                <p style='margin:0;color:#92400e;font-size:14px;line-height:1.5;'>
                                    ⏱️ <strong>Este link expira em 24 horas</strong> por motivos de segurança.
                                </p>
                            </div>
                            
                            <!-- Link alternativo -->
                            <p style='margin:24px 0 8px;color:#6b7280;font-size:13px;'>
                                Ou copie e cole este link no navegador:
                            </p>
                            <p style='margin:0;padding:12px;background:#f3f4f6;border-radius:6px;word-break:break-all;font-size:12px;color:#4b5563;'>
                                {confirmationLink}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding:24px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;'>
                            <p style='margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5;'>
                                Se você não solicitou este cadastro, pode ignorar este email com segurança.
                            </p>
                            <p style='margin:0;color:#9ca3af;font-size:12px;'>
                                © 2026 Ágora - Plataforma Acadêmica
                            </p>
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
<body style='margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,""Segoe UI"",Roboto,""Helvetica Neue"",Arial,sans-serif;'>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background-color:#f9fafb;padding:40px 16px;'>
        <tr>
            <td align='center'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:600px;background:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);overflow:hidden;border:1px solid #e5e7eb;'>
                    
                    <!-- Header com gradiente verde -->
                    <tr>
                        <td style='background:linear-gradient(135deg, #065f46 0%, #059669 100%);padding:32px 24px;text-align:center;'>
                            <h1 style='margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;'>Ágora</h1>
                            <p style='margin:8px 0 0;color:#d1fae5;font-size:14px;'>Plataforma Acadêmica</p>
                        </td>
                    </tr>
                    
                    <!-- Conteúdo -->
                    <tr>
                        <td style='padding:40px 32px;'>
                            <h2 style='margin:0 0 16px;font-size:24px;font-weight:600;color:#111827;'>Redefina sua senha</h2>
                            <p style='margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;'>
                                Olá, <strong>{name}</strong>! 🔐
                            </p>
                            <p style='margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;'>
                                Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
                            </p>
                            
                            <!-- Botão -->
                            <table role='presentation' cellspacing='0' cellpadding='0' style='margin:32px 0;'>
                                <tr>
                                    <td style='border-radius:8px;background:#059669;'>
                                        <a href='{resetLink}' style='display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;'>
                                            Redefinir minha senha
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Aviso de expiração -->
                            <div style='background:#fee2e2;border-left:4px solid #dc2626;padding:16px;margin:24px 0;border-radius:4px;'>
                                <p style='margin:0;color:#7f1d1d;font-size:14px;line-height:1.5;'>
                                    ⚠️ <strong>Este link expira em 1 hora</strong> por motivos de segurança. Se expirar, solicite uma nova redefinição.
                                </p>
                            </div>
                            
                            <!-- Link alternativo -->
                            <p style='margin:24px 0 8px;color:#6b7280;font-size:13px;'>
                                Ou copie e cole este link no navegador:
                            </p>
                            <p style='margin:0;padding:12px;background:#f3f4f6;border-radius:6px;word-break:break-all;font-size:12px;color:#4b5563;'>
                                {resetLink}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='padding:24px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;'>
                            <p style='margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5;'>
                                Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá a mesma.
                            </p>
                            <p style='margin:0;color:#9ca3af;font-size:12px;'>
                                © 2026 Ágora - Plataforma Acadêmica
                            </p>
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