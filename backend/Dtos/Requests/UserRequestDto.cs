using System.ComponentModel.DataAnnotations;

namespace Nexora.Api.Dtos.Requests;

public class UpdateProfileRequestDto
{
    [Required(ErrorMessage = "nome é obrigatório.")]
    [MaxLength(100, ErrorMessage = "nome pode ter no máximo 100 caracteres.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Course { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Bio { get; set; } = string.Empty;
}

public class ChangePasswordRequestDto
{
    [Required(ErrorMessage = "senha atual é obrigatória.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "nova senha é obrigatória.")]
    [MinLength(6, ErrorMessage = "senha deve ter no mínimo 6 caracteres.")]
    public string NewPassword { get; set; } = string.Empty;
}