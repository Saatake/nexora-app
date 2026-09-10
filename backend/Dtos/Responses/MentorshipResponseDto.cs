using Nexora.Api.Enums;

namespace Nexora.Api.Dtos.Responses;

public class MentorshipResponseDto
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string ProfessorId { get; set; } = string.Empty;
    public string ProfessorName { get; set; } = string.Empty;
    public string? ProfessorPhotoUrl { get; set; }
    public string? ProfessorCourse { get; set; }
    public string StudentAuthorId { get; set; } = string.Empty;
    public string StudentAuthorName { get; set; } = string.Empty;
    public MentorshipStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public MentorshipInitiator InitiatedBy { get; set; }
    public string InitiatedByName => InitiatedBy.ToString();
    public string? RequestMessage { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int TotalGoals { get; set; }
    public int PendingReviewGoals { get; set; }
    public int CompletedGoals { get; set; }
    public List<MentorshipGoalResponseDto> Goals { get; set; } = new();
}
