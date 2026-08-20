using Microsoft.AspNetCore.Identity;
using Nexora.Api.Enums;
using System.ComponentModel.DataAnnotations;

namespace Nexora.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string Name { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? Interests { get; set; }
    public UserRole RoleType { get; set; }

    [MaxLength(300)]
    public string? Formation { get; set; }

    public ICollection<UserTeachingArea> TeachingAreas { get; set; } = new List<UserTeachingArea>();
}