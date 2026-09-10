using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Enums;
using Nexora.Api.Models;
using Nexora.Api.Services;
using Nexora.Api.Tests.Helpers;

namespace Nexora.Api.Tests.Services;

public class BadgeServiceTests
{
    private AppDbContext CreateContext() => TestDbContextFactory.Create();

    private async Task SeedBasicData(AppDbContext context) => await TestDbContextFactory.SeedBaseDataAsync(context);

    [Fact]
    public async Task AwardBadge_ProfessorCanGiveBadge_ReturnsSuccess()
    {
        using var context = CreateContext();
        await SeedBasicData(context);
        var service = new BadgeService(context);

        var result = await service.AwardBadgeAsync(1, "prof1", BadgeType.Destaque);

        Assert.True(result.Succeeded);
        Assert.Equal(1, await context.ProjectBadges.CountAsync());
    }

    [Fact]
    public async Task AwardBadge_TwoProfessorsCanGiveSameBadgeType_BothSucceed()
    {
        using var context = CreateContext();
        await SeedBasicData(context);
        var service = new BadgeService(context);

        var r1 = await service.AwardBadgeAsync(1, "prof1", BadgeType.Inovacao);
        var r2 = await service.AwardBadgeAsync(1, "prof2", BadgeType.Inovacao);

        Assert.True(r1.Succeeded);
        Assert.True(r2.Succeeded);
        Assert.Equal(2, await context.ProjectBadges.CountAsync());
    }

    [Fact]
    public async Task AwardBadge_SameProfessorCannotGiveSameBadgeTwice_ReturnsFail()
    {
        using var context = CreateContext();
        await SeedBasicData(context);
        var service = new BadgeService(context);

        await service.AwardBadgeAsync(1, "prof1", BadgeType.Destaque);
        var result = await service.AwardBadgeAsync(1, "prof1", BadgeType.Destaque);

        Assert.False(result.Succeeded);
        Assert.Equal(1, await context.ProjectBadges.CountAsync());
    }

    [Fact]
    public async Task AwardBadge_ProjectNotFound_ReturnsFail()
    {
        using var context = CreateContext();
        await SeedBasicData(context);
        var service = new BadgeService(context);

        var result = await service.AwardBadgeAsync(99, "prof1", BadgeType.Destaque);

        Assert.False(result.Succeeded);
        Assert.True(result.IsNotFound);
    }

    [Fact]
    public async Task RemoveBadge_ProfessorRemovesOwnBadge_ReturnsSuccess()
    {
        using var context = CreateContext();
        await SeedBasicData(context);
        var service = new BadgeService(context);

        await service.AwardBadgeAsync(1, "prof1", BadgeType.Destaque);
        var result = await service.RemoveBadgeAsync(1, "prof1", BadgeType.Destaque);

        Assert.True(result.Succeeded);
        Assert.Equal(0, await context.ProjectBadges.CountAsync());
    }

    [Fact]
    public async Task RemoveBadge_ProfessorCannotRemoveOtherProfessorBadge_ReturnsFail()
    {
        using var context = CreateContext();
        await SeedBasicData(context);
        var service = new BadgeService(context);

        await service.AwardBadgeAsync(1, "prof1", BadgeType.Destaque);
        var result = await service.RemoveBadgeAsync(1, "prof2", BadgeType.Destaque);

        Assert.False(result.Succeeded);
        Assert.Equal(1, await context.ProjectBadges.CountAsync());
    }

    [Fact]
    public async Task GetBadgesForProject_ReturnsBadgesGroupedByTypeWithProfessors()
    {
        using var context = CreateContext();
        await SeedBasicData(context);
        var service = new BadgeService(context);

        await service.AwardBadgeAsync(1, "prof1", BadgeType.Inovacao);
        await service.AwardBadgeAsync(1, "prof2", BadgeType.Inovacao);
        await service.AwardBadgeAsync(1, "prof1", BadgeType.Destaque);

        var badges = await service.GetBadgesForProjectAsync(1);

        Assert.Equal(2, badges.Count);

        var inovacao = badges.First(b => b.Badge == BadgeType.Inovacao.ToString());
        Assert.Equal(2, inovacao.Count);
        Assert.Contains(inovacao.Professors, p => p.Name == "Prof. Ana");
        Assert.Contains(inovacao.Professors, p => p.Name == "Prof. Carlos");

        var destaque = badges.First(b => b.Badge == BadgeType.Destaque.ToString());
        Assert.Equal(1, destaque.Count);
    }
}
