using Nexora.Api.Dtos.Responses;
using Nexora.Api.Enums;
using Nexora.Api.Models;

namespace Nexora.Api.Interfaces;

public interface INotificationService
{
    Task<Notification> CreateNotificationAsync(string userId, NotificationType type, string title, string message, string? link = null, string? senderId = null);
    Task<PagedResponseDto<NotificationResponseDto>> GetUserNotificationsAsync(string userId, int page = 1, int pageSize = 20);
    Task<int> GetUnreadCountAsync(string userId);
    Task<bool> MarkAsReadAsync(int notificationId, string userId);
    Task<bool> MarkAllAsReadAsync(string userId);
}
