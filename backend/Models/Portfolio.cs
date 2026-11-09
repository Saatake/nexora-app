using System.ComponentModel.DataAnnotations;

namespace Nexora.Api.Models;

public class Portfolio
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    [Required, MaxLength(40)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Headline { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Bio { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Skills { get; set; } = string.Empty;

    [MaxLength(32)]
    public string Theme { get; set; } = "forest";

    public bool IsPublished { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PortfolioProject> Projects { get; set; } = new List<PortfolioProject>();
}

public class PortfolioProject
{
    public int PortfolioId { get; set; }
    public Portfolio? Portfolio { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public int SortOrder { get; set; }
}
