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

    public string GithubLink { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;

    [Required(ErrorMessage = "categoria é obrigatória.")]
    public ProjectCategory Category { get; set; }
}