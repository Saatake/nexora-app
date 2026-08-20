namespace Nexora.Api.Dtos.Responses;

public class DashboardStatsDto
{
    public int ProjectCount { get; set; }
    public double AverageGrade { get; set; }
    public int TotalViews { get; set; }
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

public class ProfessorDashboardDto
{
    public int EvaluationsGiven { get; set; }
    public int AreasCount { get; set; }
    public int PendingCount { get; set; }
    public List<PendingProjectDto> PendingProjects { get; set; } = new();
    public List<FeaturedProjectDto> FeaturedProjects { get; set; } = new();
}

public class PendingProjectDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string ThematicAreaName { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public double? CommunityAverage { get; set; }
    public int CommunityCount { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class FeaturedProjectDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string ThematicAreaName { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public double? AverageGrade { get; set; }
    public int EvaluationCount { get; set; }
    public string? ImageUrl { get; set; }
    public List<FeaturedBadgeDto> Badges { get; set; } = new();
}

public class FeaturedBadgeDto
{
    public string Badge { get; set; } = string.Empty;
    public int Count { get; set; }
}
