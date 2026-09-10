using Nexora.Api.Enums;

namespace Nexora.Api.Dtos.Responses;

public class NotificationResponseDto
{
    public int Id { get; set; }
    public NotificationType Type { get; set; }
    public string TypeName => Type.ToString();
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? SenderId { get; set; }
    public string? SenderName { get; set; }
    public string? SenderPhotoUrl { get; set; }
}
