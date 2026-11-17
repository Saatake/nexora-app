using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Nexora.Api.Enums;

namespace Nexora.Api.Models;

public class ProjectContentBlock
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    [ForeignKey(nameof(ProjectId))]
    public Project? Project { get; set; }

    public ProjectContentBlockType Type { get; set; }

    [MaxLength(5000)]
    public string? Text { get; set; }

    [MaxLength(2000)]
    public string? Url { get; set; }

    [MaxLength(300)]
    public string? Caption { get; set; }

    public int SortOrder { get; set; }
}
