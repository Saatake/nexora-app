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

    // exclusivos de professor (obrigatórios apenas quando o avaliador é professor)
    [Range(0, 10, ErrorMessage = "nota de embasamento teórico deve ser entre 0 e 10.")]
    public double? TheoreticalFoundation { get; set; }

    [Range(0, 10, ErrorMessage = "nota de contribuição acadêmica deve ser entre 0 e 10.")]
    public double? AcademicContribution { get; set; }

    [Range(0, 10, ErrorMessage = "nota de viabilidade de execução deve ser entre 0 e 10.")]
    public double? ExecutionFeasibility { get; set; }

    [MaxLength(2000)]
    public string Feedback { get; set; } = string.Empty;
}
