using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexora.Api.Models;

public class ProjectCollaborator
{
    public int ProjectId { get; set; }

    [ForeignKey("ProjectId")]
    public Project? Project { get; set; }

    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public ApplicationUser? User { get; set; }

    [MaxLength(800)]
    public string? Contribution { get; set; }

    [MaxLength(100)]
    public string? Role { get; set; }
}
