using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexora.Api.Models;

public class MentorshipMessage
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int MentorshipId { get; set; }

    [ForeignKey("MentorshipId")]
    public Mentorship? Mentorship { get; set; }

    [Required]
    public string SenderId { get; set; } = string.Empty;

    [ForeignKey("SenderId")]
    public ApplicationUser? Sender { get; set; }

    [Required]
    [MaxLength(3000)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
