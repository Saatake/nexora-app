using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Nexora.Api.Enums;

namespace Nexora.Api.Models;

public class Project
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Description { get; set; } = string.Empty;
    
    public string GithubLink { get; set; } = string.Empty;
    
    public string ImageUrl { get; set; } = string.Empty;

    [Required]
    public ProjectCategory Category { get; set; } // enum para categorias fixas
                                                  // pra add categorias tem que mexer no enum
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsApproved { get; set; } = false;

    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public ApplicationUser? User { get; set; }
}