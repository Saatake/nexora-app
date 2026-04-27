using System.ComponentModel.DataAnnotations;

namespace Nexora.Api.Dtos.Requests;

public class LoginRequestDto
{
    [Required(ErrorMessage = "e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "e-mail inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "senha é obrigatória.")]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequestDto
{
    [Required(ErrorMessage = "e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "e-mail inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "senha é obrigatória.")]
    [MinLength(6, ErrorMessage = "senha deve ter no mínimo 6 caracteres.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "nome é obrigatório.")]
    [MaxLength(100, ErrorMessage = "nome pode ter no máximo 100 caracteres.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Course { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Bio { get; set; } = string.Empty;

    public string RoleType { get; set; } = "Estudante";
}

public class ForgotPasswordRequestDto
{
    [Required(ErrorMessage = "e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "e-mail inválido.")]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequestDto
{
    [Required(ErrorMessage = "e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "e-mail inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "token é obrigatório.")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "nova senha é obrigatória.")]
    [MinLength(6, ErrorMessage = "senha deve ter no mínimo 6 caracteres.")]
    public string NewPassword { get; set; } = string.Empty;
}