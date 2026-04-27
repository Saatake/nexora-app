namespace Nexora.Api.Dtos.Responses;

public class DashboardStatsDto
{
    public int ProjectCount { get; set; }
    public double AverageGrade { get; set; }
    public int TotalViews { get; set; }
    public int PendingApproval { get; set; }
}

public class DashboardChartsDto
{
    public IEnumerable<GradeEvolutionDto> GradeEvolution { get; set; } = new List<GradeEvolutionDto>();
    public CriteriaAverageDto CriteriaAverage { get; set; } = new();
}

public class GradeEvolutionDto
{
    public string Month { get; set; } = string.Empty;
    public double Average { get; set; }
}

public class CriteriaAverageDto
{
    public double Relevance { get; set; }
    public double Quality { get; set; }
    public double Methodology { get; set; }
    public double Presentation { get; set; }
    public double Innovation { get; set; }
}
