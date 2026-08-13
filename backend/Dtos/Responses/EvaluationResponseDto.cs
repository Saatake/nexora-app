namespace Nexora.Api.Dtos.Responses;

public class EvaluationResponseDto
{
    public int Id { get; set; }
    public double Relevance { get; set; }
    public double Quality { get; set; }
    public double Methodology { get; set; }
    public double Presentation { get; set; }
    public double Innovation { get; set; }
    public double Average { get; set; }
    public double? TheoreticalFoundation { get; set; }
    public double? AcademicContribution { get; set; }
    public double? ExecutionFeasibility { get; set; }
    public double? TechnicalAverage { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public string EvaluatorId { get; set; } = string.Empty;
    public string EvaluatorName { get; set; } = string.Empty;
    public string EvaluatorRole { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
