using Microsoft.AspNetCore.Identity;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Enums;
using Nexora.Api.Helpers;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Results;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

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
    private readonly IWebHostEnvironment _env;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AuthService> logger,
        IHttpContextAccessor httpContextAccessor,
        IWebHostEnvironment env)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _emailService = emailService;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _env = env;
        _frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
    }

    public async Task<AuthResult> LoginAsync(LoginRequestDto model)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
                return Fail();

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (!result.Succeeded)
                return Fail();

            if (!user.EmailConfirmed)
            {
                try
                {
                    await SendConfirmationEmailAsync(user);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Falha ao reenviar e-mail de confirmação durante tentativa de login para {Email}", user.Email);
                }

                return new AuthResult
                {
                    Succeeded = false,
                    IsUnauthorized = true,
                    Message = "E-mail ainda não confirmado. Reenviamos um novo link de confirmação para sua caixa de entrada (verifique também o spam)."
                };
            }

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
        ApplicationUser? createdUser = null;
        try
        {
            var role = ParseRoleType(model.RoleType);
            var existingUser = await _userManager.FindByEmailAsync(model.Email);

            // Se a conta já existe mas o e-mail nunca foi confirmado, atualiza os dados/senha e reenvia a confirmação
            if (existingUser != null && !existingUser.EmailConfirmed)
            {
                existingUser.Name = model.Name ?? existingUser.Name;
                existingUser.Course = model.Course ?? existingUser.Course;
                existingUser.Bio = model.Bio ?? existingUser.Bio;
                existingUser.RoleType = role;
                existingUser.FeatureTags = role == UserRole.Professor ? "ai,ai_portfolio,ai_pdf" : existingUser.FeatureTags;

                var resetToken = await _userManager.GeneratePasswordResetTokenAsync(existingUser);
                var pwdResult = await _userManager.ResetPasswordAsync(existingUser, resetToken, model.Password);
                if (!pwdResult.Succeeded)
                {
                    return new AuthResult
                    {
                        Succeeded = false,
                        Errors = pwdResult.Errors.Select(e => e.Description)
                    };
                }

                if (_env.IsDevelopment())
                {
                    existingUser.EmailConfirmed = true;
                    await _userManager.UpdateAsync(existingUser);
                    return new AuthResult
                    {
                        Succeeded = true,
                        Message = "Cadastro concluído (dev: e-mail auto-confirmado)."
                    };
                }

                await _userManager.UpdateAsync(existingUser);
                await SendConfirmationEmailAsync(existingUser);

                return new AuthResult
                {
                    Succeeded = true,
                    Message = "Reenviamos o link de confirmação para o seu e-mail! Verifique sua caixa de entrada e spam."
                };
            }

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                Name = model.Name ?? "",
                Course = model.Course ?? "",
                Bio = model.Bio ?? "",
                RoleType = role,
                FeatureTags = role == UserRole.Professor ? "ai,ai_portfolio,ai_pdf" : null
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

            createdUser = user;

            // dev: pula a confirmação por e-mail para acelerar testes
            if (_env.IsDevelopment())
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);

                return new AuthResult
                {
                    Succeeded = true,
                    Message = "Cadastro concluído (dev: e-mail auto-confirmado)."
                };
            }

            await SendConfirmationEmailAsync(user);

            return new AuthResult
            {
                Succeeded = true,
                Message = "Usuário criado com sucesso! Verifique seu e-mail para confirmar o cadastro."
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine("REGISTER ERROR: " + ex.Message);

            if (createdUser != null)
            {
                try
                {
                    await _userManager.DeleteAsync(createdUser);
                }
                catch (Exception cleanupEx)
                {
                    _logger.LogWarning(cleanupEx, "Falha ao reverter criação do usuário {Email} após erro no envio de e-mail", createdUser.Email);
                }
            }

            return new AuthResult
            {
                Succeeded = false,
                Message = "Não foi possível enviar o e-mail de confirmação. Verifique se o endereço de e-mail é válido e tente novamente."
            };
        }
    }

    private async Task SendConfirmationEmailAsync(ApplicationUser user)
    {
        var confirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(confirmationToken);
        var frontendUrl = ResolveFrontendUrl();
        var confirmationLink = $"{frontendUrl}/confirmar-email#email={Uri.EscapeDataString(user.Email!)}&token={encodedToken}";

        var emailHtml = EmailTemplateBuilder.BuildConfirmEmail(user.Name, confirmationLink, frontendUrl);

        await _emailService.SendEmailAsync(
            user.Email!,
            "Confirme seu e-mail — Ágora",
            emailHtml
        );
    }

    public async Task<AuthResult> ConfirmEmailAsync(string email, string token)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
            return new AuthResult { Succeeded = false, Message = "usuário não encontrado." };

        if (user.EmailConfirmed)
            return new AuthResult { Succeeded = true, Message = "E-mail confirmado com sucesso!" };

        var decodedToken = Uri.UnescapeDataString(token);
        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

        if (!result.Succeeded)
            return new AuthResult
            {
                Succeeded = false,
                Message = "Token inválido ou expirado.",
                Errors = result.Errors.Select(e => e.Description)
            };

        return new AuthResult { Succeeded = true, Message = "E-mail confirmado com sucesso!" };
    }

    public async Task<AuthResult> ForgotPasswordAsync(ForgotPasswordRequestDto model)
    {
        const string successMessage = "Se o e-mail estiver cadastrado, enviaremos um link de recuperação.";

        try
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
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
            var resetLink = $"{frontendUrl}/reset-password#email={Uri.EscapeDataString(user.Email!)}&token={encodedToken}";

            var emailHtml = EmailTemplateBuilder.BuildResetPasswordEmail(user.Name, resetLink, frontendUrl);

            await _emailService.SendEmailAsync(
                user.Email!,
                "Redefina sua senha — Ágora",
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

            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
            }

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

    private string ResolveFrontendUrl()
    {
        var fallback = _frontendUrl.TrimEnd('/');
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request == null)
            return fallback;

        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            fallback,
            "https://agora.dev.br",
            "https://www.agora.dev.br",
            "https://victorious-sand-036efd210.7.azurestaticapps.net"
        };

        if (_env.IsDevelopment())
        {
            allowed.Add("http://localhost:5173");
            allowed.Add("http://localhost:3000");
        }

        var origin = request.Headers["Origin"].ToString();
        if (!string.IsNullOrWhiteSpace(origin) && Uri.TryCreate(origin, UriKind.Absolute, out var originUri))
        {
            var authority = originUri.GetLeftPart(UriPartial.Authority).TrimEnd('/');
            if (allowed.Contains(authority))
                return authority;
        }

        var referer = request.Headers["Referer"].ToString();
        if (!string.IsNullOrWhiteSpace(referer) && Uri.TryCreate(referer, UriKind.Absolute, out var refererUri))
        {
            var authority = refererUri.GetLeftPart(UriPartial.Authority).TrimEnd('/');
            if (allowed.Contains(authority))
                return authority;
        }

        return fallback;
    }
}