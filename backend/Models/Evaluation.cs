using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexora.Api.Models;

public class Evaluation
{
    [Key]
    public int Id { get; set; }

    [Range(0, 10)]
    public double Relevance { get; set; }

    [Range(0, 10)]
    public double Quality { get; set; }

    [Range(0, 10)]
    public double Methodology { get; set; }

    [Range(0, 10)]
    public double Presentation { get; set; }

    [Range(0, 10)]
    public double Innovation { get; set; }

    [MaxLength(2000)]
    public string Feedback { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public string ProfessorId { get; set; } = string.Empty;

    [ForeignKey("ProfessorId")]
    public ApplicationUser? Professor { get; set; }

    [Required]
    public int ProjectId { get; set; }

    [ForeignKey("ProjectId")]
    public Project? Project { get; set; }
}
