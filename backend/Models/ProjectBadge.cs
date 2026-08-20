using Nexora.Api.Enums;

namespace Nexora.Api.Models;

public class ProjectBadge
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public string ProfessorId { get; set; } = string.Empty;
    public ApplicationUser Professor { get; set; } = null!;
    public BadgeType Badge { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
