using Nexora.Api.Dtos.Responses;
using Nexora.Api.Controllers;
using Nexora.Api.Enums;
using Nexora.Api.Models;
using System.Reflection;

public class PortfolioResponseTests
{
    [Fact]
    public void ProjectResponse_ExposesOrderedProjectMediaAndContributorAttribution()
    {
        var projectType = typeof(PortfolioProjectResponseDto);

        Assert.NotNull(projectType.GetProperty("ContentBlocks"));
        Assert.NotNull(projectType.GetProperty("Contributors"));
    }

    [Fact]
    public void PublicPortfolioProjection_ReturnsProjectMediaAndOmitsPrivateProjects()
    {
        var portfolio = new Portfolio
        {
            User = new ApplicationUser { Name = "Autora" },
            Projects =
            [
                new PortfolioProject
                {
                    SortOrder = 0,
                    Project = new Project
                    {
                        Id = 1,
                        Title = "Pesquisa pública",
                        Description = "Descrição",
                        ContentBlocks = [new ProjectContentBlock { Type = ProjectContentBlockType.Image, Url = "https://cdn.example/image.jpg", SortOrder = 0 }],
                        Collaborators = [new ProjectCollaborator { User = new ApplicationUser { Name = "Colega" }, Role = "Fotografia", Contribution = "Registrou o processo." }]
                    }
                },
                new PortfolioProject
                {
                    SortOrder = 1,
                    Project = new Project { Id = 2, Title = "Pesquisa privada", IsPrivate = true }
                }
            ]
        };
        var mapper = typeof(PortfolioController).GetMethod("ToResponse", BindingFlags.NonPublic | BindingFlags.Static);
        Assert.NotNull(mapper);

        var response = Assert.IsType<PortfolioResponseDto>(mapper.Invoke(null, [portfolio, false]));

        var visibleProject = Assert.Single(response.Projects);
        Assert.Equal("Image", Assert.Single(visibleProject.ContentBlocks).Type);
        Assert.Equal("Colega", Assert.Single(visibleProject.Contributors).Name);
        Assert.Equal("Registrou o processo.", visibleProject.Contributors[0].Contribution);
    }
}
