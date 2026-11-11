using System.ComponentModel.DataAnnotations;
using Nexora.Api.Enums;

namespace Nexora.Api.Dtos.Requests;

public class ProjectContentBlockRequestDto
{
    public ProjectContentBlockType Type { get; set; }

    [MaxLength(5000)]
    public string? Text { get; set; }

    [MaxLength(2000)]
    public string? Url { get; set; }

    [MaxLength(300)]
    public string? Caption { get; set; }

    public int SortOrder { get; set; }
}

public class ProjectCollaboratorRequestDto
{
    [Required]
    public string Id { get; set; } = string.Empty;

    [MaxLength(800)]
    public string? Contribution { get; set; }
}
