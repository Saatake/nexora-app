using System.ComponentModel.DataAnnotations.Schema;
using Nexora.Api.Enums;

namespace Nexora.Api.Models;

public class UserTeachingArea
{
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public ApplicationUser? User { get; set; }

    public ThematicArea Area { get; set; }
}
