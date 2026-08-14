using System.ComponentModel.DataAnnotations;
using Nexora.Api.Enums;

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

    [MaxLength(500)]
    public string? PhotoUrl { get; set; }

    [MaxLength(500)]
    public string? Interests { get; set; }

    [MaxLength(300)]
    public string? Formation { get; set; }
}

public class UpdateTeachingAreasRequestDto
{
    public List<ThematicArea> Areas { get; set; } = new();
}

public class ChangePasswordRequestDto
{
    [Required(ErrorMessage = "senha atual é obrigatória.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "nova senha é obrigatória.")]
    [MinLength(6, ErrorMessage = "senha deve ter no mínimo 6 caracteres.")]
    public string NewPassword { get; set; } = string.Empty;
}