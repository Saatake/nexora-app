using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Nexora.Api.Enums;

namespace Nexora.Api.Models;

public class Mentorship
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ProjectId { get; set; }

    [ForeignKey("ProjectId")]
    public Project? Project { get; set; }

    [Required]
    public string ProfessorId { get; set; } = string.Empty;

    [ForeignKey("ProfessorId")]
    public ApplicationUser? Professor { get; set; }

    [Required]
    public MentorshipStatus Status { get; set; } = MentorshipStatus.PendingApproval;

    [Required]
    public MentorshipInitiator InitiatedBy { get; set; }

    [MaxLength(1000)]
    public string? RequestMessage { get; set; }

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public DateTime? AcceptedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public ICollection<MentorshipGoal> Goals { get; set; } = new List<MentorshipGoal>();
    public ICollection<MentorshipMessage> Messages { get; set; } = new List<MentorshipMessage>();
}
