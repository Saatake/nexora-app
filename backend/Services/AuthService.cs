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
            var role = ParseRoleType(model.RoleType);
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

            return new AuthResult
            {
                Succeeded = true,
                Message = "Usuário criado com sucesso! Verifique seu e-mail para confirmar o cadastro."
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