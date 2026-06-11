namespace Nexora.Api.Dtos.Responses;

public class CollaboratorDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? Course { get; set; }
}
