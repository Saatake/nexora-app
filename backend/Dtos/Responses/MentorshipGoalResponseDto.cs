using Nexora.Api.Enums;

namespace Nexora.Api.Dtos.Responses;

public class MentorshipGoalResponseDto
{
    public int Id { get; set; }
    public int MentorshipId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public MentorshipGoalStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public string? ProfessorFeedback { get; set; }
    public string? StudentSubmissionNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
