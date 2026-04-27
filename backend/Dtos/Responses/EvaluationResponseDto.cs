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
    public string Feedback { get; set; } = string.Empty;
    public string ProfessorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
