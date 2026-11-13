using System.Text.Json;
using Nexora.Api.Models;
using Nexora.Api.Services;

public class PortfolioProjectEvidenceTests
{
    [Fact]
    public void Create_PreservesOrderedMediaAndSeparatesOwnerFromCollaboratorContributions()
    {
        var project = new Project
        {
            Id = 41,
            UserId = "owner",
            Title = "Exposição de memória",
            AuthorRole = "Pesquisa de campo",
            AuthorContribution = "Conduzi entrevistas com moradores.",
            ContentBlocks =
            [
                new ProjectContentBlock { Type = Nexora.Api.Enums.ProjectContentBlockType.YouTube, Url = "https://youtu.be/abc123XYZ_0", Caption = "Pitch", SortOrder = 2 },
                new ProjectContentBlock { Type = Nexora.Api.Enums.ProjectContentBlockType.Text, Text = "Contexto histórico", SortOrder = 0 },
                new ProjectContentBlock { Type = Nexora.Api.Enums.ProjectContentBlockType.Image, Url = "https://storage.example/owner/foto.jpg", Caption = "Montagem", SortOrder = 1 }
            ],
            Collaborators =
            [
                new ProjectCollaborator
                {
                    Role = "Design",
                    Contribution = "Desenvolveu a identidade visual.",
                    User = new ApplicationUser { Name = "Outra pessoa" }
                }
            ]
        };

        var json = JsonSerializer.Serialize(PortfolioProjectEvidence.Create(project, "owner"));
        using var evidence = JsonDocument.Parse(json);
        var root = evidence.RootElement;

        Assert.Equal("Conduzi entrevistas com moradores.", root.GetProperty("ownerContribution").GetString());
        Assert.Equal("Pesquisa de campo", root.GetProperty("ownerRole").GetString());
        Assert.Equal("Contexto histórico", root.GetProperty("contentBlocks")[0].GetProperty("text").GetString());
        Assert.Equal("Image", root.GetProperty("contentBlocks")[1].GetProperty("type").GetString());
        Assert.Equal("YouTube", root.GetProperty("contentBlocks")[2].GetProperty("type").GetString());
        Assert.Equal("Desenvolveu a identidade visual.", root.GetProperty("collaborators")[0].GetProperty("contribution").GetString());
        Assert.False(root.GetProperty("collaborators")[0].TryGetProperty("name", out _));
    }

    [Fact]
    public void Create_DoesNotAttributeSomeoneElsesContributionToTheOwner()
    {
        var project = new Project
        {
            Id = 8,
            UserId = "owner",
            Title = "Trabalho em grupo",
            Collaborators = [new ProjectCollaborator { Role = "Fotografia", Contribution = "Registrou o evento." }]
        };

        var json = JsonSerializer.Serialize(PortfolioProjectEvidence.Create(project, "owner"));
        using var evidence = JsonDocument.Parse(json);

        Assert.Equal("", evidence.RootElement.GetProperty("ownerContribution").GetString());
        Assert.Equal("Registrou o evento.", evidence.RootElement.GetProperty("collaborators")[0].GetProperty("contribution").GetString());
    }
}
