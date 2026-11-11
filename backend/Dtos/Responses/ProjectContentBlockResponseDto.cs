namespace Nexora.Api.Dtos.Responses;

public class ProjectTagOptionDto
{
    public string Value { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
}

public class ProjectContentBlockResponseDto
{
    public string Type { get; set; } = string.Empty;
    public string? Text { get; set; }
    public string? Url { get; set; }
    public string? Caption { get; set; }
    public int SortOrder { get; set; }
}
