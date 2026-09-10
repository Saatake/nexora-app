using Microsoft.EntityFrameworkCore;
using Nexora.Api.Enums;
using Nexora.Api.Models;
using Nexora.Api.Services;
using Nexora.Api.Tests.Helpers;

namespace Nexora.Api.Tests.Services;

public class NotificationServiceTests
{
    private NotificationService CreateService(out Api.Data.AppDbContext context)
    {
        context = TestDbContextFactory.Create();
        return new NotificationService(context);
    }

    // ==================== CreateNotificationAsync ====================

    [Fact]
    public async Task CreateNotificationAsync_ShouldPersistNotification()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.Add(TestDbContextFactory.CreateStudent("user1", "João"));
            await context.SaveChangesAsync();

            var notification = await service.CreateNotificationAsync(
                userId: "user1",
                type: NotificationType.MentorshipRequest,
                title: "Nova solicitação",
                message: "Você recebeu um convite.",
                link: "/projects/1",
                senderId: "prof1");

            Assert.NotNull(notification);
            Assert.Equal("user1", notification.UserId);
            Assert.Equal(NotificationType.MentorshipRequest, notification.Type);
            Assert.Equal("Nova solicitação", notification.Title);
            Assert.Equal("/projects/1", notification.Link);
            Assert.False(notification.IsRead);
            Assert.Equal(1, await context.Notifications.CountAsync());
        }
    }

    [Fact]
    public async Task CreateNotificationAsync_ShouldSetSenderIdAsNull_WhenNotProvided()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.Add(TestDbContextFactory.CreateStudent("user1", "João"));
            await context.SaveChangesAsync();

            var notification = await service.CreateNotificationAsync(
                userId: "user1",
                type: NotificationType.ProjectUpdated,
                title: "Projeto atualizado",
                message: "Seu projeto foi editado.");

            Assert.Null(notification.SenderId);
        }
    }

    // ==================== GetUserNotificationsAsync ====================

    [Fact]
    public async Task GetUserNotificationsAsync_ShouldReturnPaged()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.Add(TestDbContextFactory.CreateStudent("user1", "João"));
            await context.SaveChangesAsync();

            // Criar 5 notificações
            for (int i = 0; i < 5; i++)
            {
                await service.CreateNotificationAsync("user1", NotificationType.GoalCreated, $"Meta {i}", $"Mensagem {i}");
            }

            var result = await service.GetUserNotificationsAsync("user1", page: 1, pageSize: 3);

            Assert.Equal(5, result.TotalCount);
            Assert.Equal(3, result.Items.Count());
            Assert.Equal(1, result.Page);
            Assert.Equal(3, result.PageSize);
        }
    }

    [Fact]
    public async Task GetUserNotificationsAsync_ShouldReturnOnlyForRequestedUser()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.AddRange(
                TestDbContextFactory.CreateStudent("user1", "João"),
                TestDbContextFactory.CreateStudent("user2", "Maria"));
            await context.SaveChangesAsync();

            await service.CreateNotificationAsync("user1", NotificationType.GoalCreated, "Para user1", "Msg");
            await service.CreateNotificationAsync("user2", NotificationType.GoalCreated, "Para user2", "Msg");
            await service.CreateNotificationAsync("user1", NotificationType.MentorshipAccepted, "Para user1 tb", "Msg");

            var result = await service.GetUserNotificationsAsync("user1");

            Assert.Equal(2, result.TotalCount);
        }
    }

    [Fact]
    public async Task GetUserNotificationsAsync_ShouldReturnOrderedByCreatedAtDesc()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.Add(TestDbContextFactory.CreateStudent("user1", "João"));
            await context.SaveChangesAsync();

            await service.CreateNotificationAsync("user1", NotificationType.GoalCreated, "Primeira", "Msg");
            await service.CreateNotificationAsync("user1", NotificationType.GoalSubmitted, "Segunda", "Msg");
            await service.CreateNotificationAsync("user1", NotificationType.MentorshipAccepted, "Terceira", "Msg");

            var result = await service.GetUserNotificationsAsync("user1");
            var titles = result.Items.Select(n => n.Title).ToList();

            // Mais recente primeiro
            Assert.Equal("Terceira", titles[0]);
            Assert.Equal("Segunda", titles[1]);
            Assert.Equal("Primeira", titles[2]);
        }
    }

    // ==================== GetUnreadCountAsync ====================

    [Fact]
    public async Task GetUnreadCountAsync_ShouldCountOnlyUnread()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.Add(TestDbContextFactory.CreateStudent("user1", "João"));
            await context.SaveChangesAsync();

            var n1 = await service.CreateNotificationAsync("user1", NotificationType.GoalCreated, "T1", "M1");
            await service.CreateNotificationAsync("user1", NotificationType.GoalSubmitted, "T2", "M2");
            await service.CreateNotificationAsync("user1", NotificationType.MentorshipRequest, "T3", "M3");

            // Marca uma como lida
            await service.MarkAsReadAsync(n1.Id, "user1");

            var count = await service.GetUnreadCountAsync("user1");
            Assert.Equal(2, count);
        }
    }

    [Fact]
    public async Task GetUnreadCountAsync_ShouldReturnZero_WhenAllRead()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.Add(TestDbContextFactory.CreateStudent("user1", "João"));
            await context.SaveChangesAsync();

            await service.CreateNotificationAsync("user1", NotificationType.GoalCreated, "T1", "M1");
            await service.MarkAllAsReadAsync("user1");

            var count = await service.GetUnreadCountAsync("user1");
            Assert.Equal(0, count);
        }
    }

    // ==================== MarkAsReadAsync ====================

    [Fact]
    public async Task MarkAsReadAsync_ShouldUpdateIsRead()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.Add(TestDbContextFactory.CreateStudent("user1", "João"));
            await context.SaveChangesAsync();

            var n = await service.CreateNotificationAsync("user1", NotificationType.GoalCreated, "Test", "Msg");
            Assert.False(n.IsRead);

            var success = await service.MarkAsReadAsync(n.Id, "user1");
            Assert.True(success);

            var updated = await context.Notifications.FindAsync(n.Id);
            Assert.True(updated!.IsRead);
        }
    }

    [Fact]
    public async Task MarkAsReadAsync_ShouldReturnFalse_WhenNotificationDoesNotExist()
    {
        var service = CreateService(out var context);
        using (context)
        {
            var success = await service.MarkAsReadAsync(999, "user1");
            Assert.False(success);
        }
    }

    [Fact]
    public async Task MarkAsReadAsync_ShouldReturnFalse_WhenUserDoesNotOwn()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.AddRange(
                TestDbContextFactory.CreateStudent("user1", "João"),
                TestDbContextFactory.CreateStudent("user2", "Maria"));
            await context.SaveChangesAsync();

            var n = await service.CreateNotificationAsync("user1", NotificationType.GoalCreated, "Test", "Msg");

            var success = await service.MarkAsReadAsync(n.Id, "user2");
            Assert.False(success);
        }
    }

    // ==================== MarkAllAsReadAsync ====================

    [Fact]
    public async Task MarkAllAsReadAsync_ShouldMarkAllUnread()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.Add(TestDbContextFactory.CreateStudent("user1", "João"));
            await context.SaveChangesAsync();

            await service.CreateNotificationAsync("user1", NotificationType.GoalCreated, "T1", "M1");
            await service.CreateNotificationAsync("user1", NotificationType.GoalSubmitted, "T2", "M2");
            await service.CreateNotificationAsync("user1", NotificationType.MentorshipRequest, "T3", "M3");

            var success = await service.MarkAllAsReadAsync("user1");
            Assert.True(success);

            var unread = await service.GetUnreadCountAsync("user1");
            Assert.Equal(0, unread);
        }
    }

    [Fact]
    public async Task MarkAllAsReadAsync_ShouldNotAffectOtherUsers()
    {
        var service = CreateService(out var context);
        using (context)
        {
            context.Users.AddRange(
                TestDbContextFactory.CreateStudent("user1", "João"),
                TestDbContextFactory.CreateStudent("user2", "Maria"));
            await context.SaveChangesAsync();

            await service.CreateNotificationAsync("user1", NotificationType.GoalCreated, "T1", "M1");
            await service.CreateNotificationAsync("user2", NotificationType.GoalCreated, "T2", "M2");

            await service.MarkAllAsReadAsync("user1");

            Assert.Equal(0, await service.GetUnreadCountAsync("user1"));
            Assert.Equal(1, await service.GetUnreadCountAsync("user2"));
        }
    }
}
