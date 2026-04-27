namespace Nexora.Api.Dtos.Responses;

public class RankingProjectDto
{
    public int Position { get; set; }
    public int ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public double AverageGrade { get; set; }
    public int ViewCount { get; set; }
}

public class RankingStudentDto
{
    public int Position { get; set; }
    public string StudentId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public double AverageGrade { get; set; }
    public int ProjectCount { get; set; }
}

public class GeneralStatsDto
{
    public int TotalProjects { get; set; }
    public double GeneralAverage { get; set; }
    public int TotalViews { get; set; }
    public int TotalStudents { get; set; }
}
