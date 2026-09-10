using System.ComponentModel.DataAnnotations;

namespace Nexora.Api.Dtos.Requests;

public class RequestMentorshipRequestDto
{
    // Preenchido quando o estudante convida um professor
    public string? ProfessorId { get; set; }

    [MaxLength(1000)]
    public string? Message { get; set; }
}

public class CreateMentorshipGoalRequestDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public DateTime? DueDate { get; set; }
}

public class SubmitMentorshipGoalRequestDto
{
    [MaxLength(2000)]
    public string? Note { get; set; }
}

public class ReviewMentorshipGoalRequestDto
{
    [Required]
    public bool Approved { get; set; }

    [MaxLength(2000)]
    public string? Feedback { get; set; }
}

public class SendMentorshipMessageRequestDto
{
    [Required]
    [MaxLength(3000)]
    public string Content { get; set; } = string.Empty;
}
