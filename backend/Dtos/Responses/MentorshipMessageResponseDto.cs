namespace Nexora.Api.Dtos.Responses;

public class MentorshipMessageResponseDto
{
    public int Id { get; set; }
    public int MentorshipId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string? SenderPhotoUrl { get; set; }
    public string SenderRole { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
