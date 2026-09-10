using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;

namespace Nexora.Api.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Notification> CreateNotificationAsync(
        string userId,
        NotificationType type,
        string title,
        string message,
        string? link = null,
        string? senderId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            SenderId = senderId,
            Type = type,
            Title = title,
            Message = message,
            Link = link,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return notification;
    }

    public async Task<PagedResponseDto<NotificationResponseDto>> GetUserNotificationsAsync(string userId, int page = 1, int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;

        var query = _context.Notifications
            .Where(n => n.UserId == userId)
            .Include(n => n.Sender)
            .OrderByDescending(n => n.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationResponseDto
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Message = n.Message,
                Link = n.Link,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                SenderId = n.SenderId,
                SenderName = n.Sender != null ? n.Sender.Name : null,
                SenderPhotoUrl = n.Sender != null ? n.Sender.PhotoUrl : null
            })
            .ToListAsync();

        return new PagedResponseDto<NotificationResponseDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        if (_context.Database.IsRelational())
        {
            await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        }
        else
        {
            var unread = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in unread)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
        }

        return true;
    }
}
