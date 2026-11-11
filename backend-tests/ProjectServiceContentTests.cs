using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Enums;
using Nexora.Api.Models;
using Nexora.Api.Repositories;
using Nexora.Api.Services;

public class ProjectServiceContentTests
{
    [Fact]
    public async Task CreateProject_PersistsOrderedBlocksAndCanonicalIndividualContributions()
    {
        await using var context = CreateContext();
        context.Users.AddRange(
            new ApplicationUser { Id = "author", Name = "Autor" },
            new ApplicationUser { Id = "member", Name = "Integrante" });
        await context.SaveChangesAsync();
        var service = new ProjectService(new ProjectRepository(context), null!, null!);

        var result = await service.CreateProjectAsync(new CreateProjectRequestDto
        {
            Title = "Exposição de memória local",
            Description = "Pesquisa e exposição comunitária.",
            ThematicArea = ThematicArea.HumanidadesSociedadeDireito,
            Category = ProjectCategory.PesquisaCientifica,
            SelectedTags = ["Historia", "IA"],
            AuthorContribution = "Conduzi as entrevistas.",
            Collaborators = [new ProjectCollaboratorRequestDto { Id = "member", Contribution = "Organizou a exposição." }],
            ContentBlocks =
            [
                new ProjectContentBlockRequestDto { Type = ProjectContentBlockType.Text, Text = "Contexto", SortOrder = 1 },
                new ProjectContentBlockRequestDto { Type = ProjectContentBlockType.Image, Url = "https://storage.example.org/exhibit.jpg", SortOrder = 0 }
            ]
        }, "author");

        Assert.Equal("História, Inteligência artificial", result.Tags);
        Assert.Equal("Conduzi as entrevistas.", result.AuthorContribution);
        Assert.Equal(["Image", "Text"], result.ContentBlocks.Select(block => block.Type));
        Assert.Equal("Organizou a exposição.", Assert.Single(result.Collaborators).Contribution);
        Assert.Equal(2, await context.ProjectContentBlocks.CountAsync());
    }

    [Fact]
    public async Task UpdateProject_OmittingContentBlocksPreservesExistingBlocksForLegacyClients()
    {
        await using var context = CreateContext();
        context.Users.Add(new ApplicationUser { Id = "author", Name = "Autor" });
        var project = new Project
        {
            Title = "Projeto legado",
            Description = "Descrição",
            UserId = "author",
            Category = ProjectCategory.Tcc,
            ThematicArea = ThematicArea.TecnologiaInovacao,
            ContentBlocks =
            [
                new ProjectContentBlock
                {
                    Type = ProjectContentBlockType.Text,
                    Text = "Conteúdo já publicado",
                    SortOrder = 0
                }
            ]
        };
        context.Projects.Add(project);
        await context.SaveChangesAsync();
        var service = new ProjectService(new ProjectRepository(context), null!, null!);

        var result = await service.UpdateAsync(project.Id, new UpdateProjectRequestDto
        {
            Title = "Projeto legado atualizado",
            Description = "Descrição atualizada",
            ThematicArea = ThematicArea.TecnologiaInovacao,
            Category = ProjectCategory.Tcc,
            CollaboratorIds = []
        }, "author");

        Assert.True(result.Succeeded);
        Assert.Equal("Conteúdo já publicado", await context.ProjectContentBlocks.Select(block => block.Text).SingleAsync());
    }

    [Fact]
    public async Task SearchProjects_FindsCanonicalTagsThroughAccentInsensitiveAliases()
    {
        await using var context = CreateContext();
        context.Users.Add(new ApplicationUser { Id = "author", Name = "Autor" });
        context.Projects.Add(new Project
        {
            Title = "Exposição sobre a cidade",
            Description = "Relatos de moradores.",
            UserId = "author",
            Category = ProjectCategory.PesquisaCientifica,
            ThematicArea = ThematicArea.HumanidadesSociedadeDireito,
            Tags = "História"
        });
        await context.SaveChangesAsync();
        var repository = new ProjectRepository(context);

        var (items, totalCount) = await repository.GetFilteredAsync("Historia", null, null, null, null, 1, 10);

        Assert.Equal(1, totalCount);
        Assert.Equal("Exposição sobre a cidade", Assert.Single(items).Title);
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"showcase_{Guid.NewGuid()}")
            .Options;
        return new AppDbContext(options);
    }
}
