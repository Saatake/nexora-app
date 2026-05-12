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

    [MaxLength(200)]
    public string? Summary { get; set; }

    [MaxLength(120)]
    public string? Course { get; set; }

    [MaxLength(120)]
    public string? Area { get; set; }

    [MaxLength(120)]
    public string? Advisor { get; set; }

    [MaxLength(1000)]
    public string? TeamMembers { get; set; }
    
    public string GithubLink { get; set; } = string.Empty;
    
    public string FileUrl { get; set; } = string.Empty;

    [Required]
    public ProjectCategory Category { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsApproved { get; set; } = false;

    public int ViewCount { get; set; } = 0;
    public int DownloadCount { get; set; } = 0;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public ApplicationUser? User { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();
}