using System.ComponentModel.DataAnnotations;

namespace Nexora.Api.Dtos.Requests;

public class CreateEvaluationRequestDto
{
    [Required]
    [Range(0, 10, ErrorMessage = "nota de relevância deve ser entre 0 e 10.")]
    public double Relevance { get; set; }

    [Required]
    [Range(0, 10, ErrorMessage = "nota de qualidade deve ser entre 0 e 10.")]
    public double Quality { get; set; }

    [Required]
    [Range(0, 10, ErrorMessage = "nota de metodologia deve ser entre 0 e 10.")]
    public double Methodology { get; set; }

    [Required]
    [Range(0, 10, ErrorMessage = "nota de apresentação deve ser entre 0 e 10.")]
    public double Presentation { get; set; }

    [Required]
    [Range(0, 10, ErrorMessage = "nota de inovação deve ser entre 0 e 10.")]
    public double Innovation { get; set; }

    [MaxLength(2000)]
    public string Feedback { get; set; } = string.Empty;
}
