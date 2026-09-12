using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexora.Api.Models;

public class MentorshipTask
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int MentorshipGoalId { get; set; }

    [ForeignKey("MentorshipGoalId")]
    public MentorshipGoal? MentorshipGoal { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public bool IsCompleted { get; set; } = false;

    public DateTime? CompletedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
