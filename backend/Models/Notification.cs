using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Nexora.Api.Enums;

namespace Nexora.Api.Models;

public class Notification
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public ApplicationUser? User { get; set; }

    public string? SenderId { get; set; }

    [ForeignKey("SenderId")]
    public ApplicationUser? Sender { get; set; }

    [Required]
    public NotificationType Type { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Link { get; set; }

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
