using Nexora.Api.Dtos.Requests;
using Nexora.Api.Results;

namespace Nexora.Api.Interfaces;

public interface IAuthService
{
    Task<AuthResult> LoginAsync(LoginRequestDto model);
    Task<AuthResult> RegisterAsync(RegisterRequestDto model);
    Task<AuthResult> ConfirmEmailAsync(string email, string token);
    Task<AuthResult> ForgotPasswordAsync(ForgotPasswordRequestDto model);
    Task<AuthResult> ResetPasswordAsync(ResetPasswordRequestDto model);
}