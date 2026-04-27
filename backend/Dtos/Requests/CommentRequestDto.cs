using System.ComponentModel.DataAnnotations;

namespace Nexora.Api.Dtos.Requests;

public class CreateCommentRequestDto
{
    [Required(ErrorMessage = "texto do comentário é obrigatório.")]
    [MaxLength(2000, ErrorMessage = "comentário pode ter no máximo 2000 caracteres.")]
    public string Text { get; set; } = string.Empty;
}
