using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Controllers;

[Route("api/notifications")]
[Authorize]
public class NotificationController : ApiBaseController
{
    private readonly INotificationService _notificationService;

    public NotificationController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        return Ok(await _notificationService.GetUserNotificationsAsync(userId, page, pageSize));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(new { unreadCount = count });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        var success = await _notificationService.MarkAsReadAsync(id, userId);
        if (!success) return NotFound(new { message = "Notificação não encontrada." });
        return Ok(new { message = "Marcada como lida." });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(new { message = "Todas as notificações foram marcadas como lidas." });
    }
}
