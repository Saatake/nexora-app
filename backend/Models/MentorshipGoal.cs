using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Nexora.Api.Enums;

namespace Nexora.Api.Models;

public class MentorshipGoal
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int MentorshipId { get; set; }

    [ForeignKey("MentorshipId")]
    public Mentorship? Mentorship { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public DateTime? DueDate { get; set; }

    [Required]
    public MentorshipGoalStatus Status { get; set; } = MentorshipGoalStatus.Pending;

    [MaxLength(2000)]
    public string? ProfessorFeedback { get; set; }

    [MaxLength(2000)]
    public string? StudentSubmissionNote { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }
}
