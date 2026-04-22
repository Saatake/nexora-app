using Microsoft.AspNetCore.Identity;
using Nexora.Api.Enums;

namespace Nexora.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string Name { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public UserRole RoleType { get; set; }
}