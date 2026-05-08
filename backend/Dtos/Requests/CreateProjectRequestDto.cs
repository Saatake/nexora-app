using System.ComponentModel.DataAnnotations;
using Nexora.Api.Enums;

namespace Nexora.Api.Dtos.Requests;

public class CreateProjectRequestDto
{
    [Required(ErrorMessage = "título é obrigatório.")]
    [MaxLength(200, ErrorMessage = "título pode ter no máximo 200 caracteres.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "descrição é obrigatória.")]
    [MaxLength(5000, ErrorMessage = "descrição pode ter no máximo 5000 caracteres.")]
    public string Description { get; set; } = string.Empty;

    [MaxLength(200, ErrorMessage = "resumo pode ter no máximo 200 caracteres.")]
    public string? Summary { get; set; }

    [MaxLength(120, ErrorMessage = "curso pode ter no máximo 120 caracteres.")]
    public string? Course { get; set; }

    [MaxLength(120, ErrorMessage = "área pode ter no máximo 120 caracteres.")]
    public string? Area { get; set; }

    [MaxLength(120, ErrorMessage = "orientador pode ter no máximo 120 caracteres.")]
    public string? Advisor { get; set; }

    [MaxLength(1000, ErrorMessage = "integrantes pode ter no máximo 1000 caracteres.")]
    public string? TeamMembers { get; set; }

    public string GithubLink { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;

    [Required(ErrorMessage = "categoria é obrigatória.")]
    public ProjectCategory Category { get; set; }
}

public class UpdateProjectRequestDto
{
    [Required(ErrorMessage = "título é obrigatório.")]
    [MaxLength(200, ErrorMessage = "título pode ter no máximo 200 caracteres.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "descrição é obrigatória.")]
    [MaxLength(5000, ErrorMessage = "descrição pode ter no máximo 5000 caracteres.")]
    public string Description { get; set; } = string.Empty;

    [MaxLength(200, ErrorMessage = "resumo pode ter no máximo 200 caracteres.")]
    public string? Summary { get; set; }

    [MaxLength(120, ErrorMessage = "curso pode ter no máximo 120 caracteres.")]
    public string? Course { get; set; }

    [MaxLength(120, ErrorMessage = "área pode ter no máximo 120 caracteres.")]
    public string? Area { get; set; }

    [MaxLength(120, ErrorMessage = "orientador pode ter no máximo 120 caracteres.")]
    public string? Advisor { get; set; }

    [MaxLength(1000, ErrorMessage = "integrantes pode ter no máximo 1000 caracteres.")]
    public string? TeamMembers { get; set; }

    public string GithubLink { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;

    [Required(ErrorMessage = "categoria é obrigatória.")]
    public ProjectCategory Category { get; set; }
}