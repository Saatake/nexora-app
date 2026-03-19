using Microsoft.AspNetCore.Identity;

namespace Nexora.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string Name { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string RoleType { get; set; } = "Student"; 
}