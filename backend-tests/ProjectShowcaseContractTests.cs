using System.Collections;
using System.Reflection;
using Nexora.Api.Enums;
using Nexora.Api.Models;
using Nexora.Api.Controllers;
using Microsoft.AspNetCore.Mvc;

public class ProjectShowcaseContractTests
{
    private static readonly Assembly ApiAssembly = typeof(Project).Assembly;

    [Fact]
    public void ProjectCategories_CoverResearchCreativeAndAppliedWork()
    {
        var names = Enum.GetNames<ProjectCategory>();

        Assert.Contains("PesquisaCientifica", names);
        Assert.Contains("Prototipo", names);
        Assert.Contains("ProducaoArtistica", names);
        Assert.Contains("IntervencaoSocial", names);
        Assert.Contains("Negocio", names);
    }

    [Fact]
    public void ProjectModel_StoresOrderedContentAndIndividualContributions()
    {
        var blockType = ApiAssembly.GetType("Nexora.Api.Models.ProjectContentBlock");

        Assert.NotNull(blockType);
        Assert.NotNull(typeof(Project).GetProperty("ContentBlocks"));
        Assert.NotNull(typeof(Project).GetProperty("AuthorContribution"));
        Assert.NotNull(typeof(Project).GetProperty("AuthorRole"));
        Assert.NotNull(typeof(ProjectCollaborator).GetProperty("Contribution"));
        Assert.NotNull(typeof(ProjectCollaborator).GetProperty("Role"));
        Assert.NotNull(blockType.GetProperty("SortOrder"));
        Assert.NotNull(blockType.GetProperty("Url"));
        Assert.NotNull(blockType.GetProperty("Text"));
    }

    [Fact]
    public void ContentValidator_AcceptsSecureYouTubeVideoUrl()
    {
        var errors = ValidateBlock("YouTube", url: "https://youtu.be/dQw4w9WgXcQ");

        Assert.Empty(errors);
    }

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ")]
    [InlineData("https://example.com/watch?v=dQw4w9WgXcQ")]
    public void ContentValidator_RejectsUnsafeOrNonYouTubeVideoUrls(string url)
    {
        var errors = ValidateBlock("YouTube", url: url);

        Assert.NotEmpty(errors);
    }

    [Fact]
    public void ContentValidator_RejectsTextBlockWithoutText()
    {
        var errors = ValidateBlock("Text");

        Assert.NotEmpty(errors);
    }

    [Fact]
    public void ContentValidator_AllowsOnlyOneYouTubePitchPerProject()
    {
        var validatorType = ApiAssembly.GetType("Nexora.Api.Services.ProjectContentBlockValidator");
        var requestType = ApiAssembly.GetType("Nexora.Api.Dtos.Requests.ProjectContentBlockRequestDto");
        var kindType = ApiAssembly.GetType("Nexora.Api.Enums.ProjectContentBlockType");
        Assert.NotNull(validatorType);
        Assert.NotNull(requestType);
        Assert.NotNull(kindType);

        var collectionType = typeof(List<>).MakeGenericType(requestType);
        var requests = (IList)Activator.CreateInstance(collectionType)!;
        for (var i = 0; i < 2; i++)
        {
            var request = Activator.CreateInstance(requestType)!;
            requestType.GetProperty("Type")!.SetValue(request, Enum.Parse(kindType, "YouTube"));
            requestType.GetProperty("Url")!.SetValue(request, "https://youtu.be/dQw4w9WgXcQ");
            requestType.GetProperty("SortOrder")!.SetValue(request, i);
            requests.Add(request);
        }

        var validate = validatorType.GetMethod("Validate", BindingFlags.Public | BindingFlags.Static)!;
        var errors = Assert.IsAssignableFrom<IReadOnlyCollection<string>>(validate.Invoke(null, [requests]));

        Assert.Contains(errors, error => error.Contains("vídeo pitch", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void TagCatalog_MapsAccentsAndAliasesToOneSearchableLabel()
    {
        var catalog = ApiAssembly.GetType("Nexora.Api.Services.ProjectTagCatalog");
        Assert.NotNull(catalog);

        var method = catalog.GetMethod("TryCanonicalize", BindingFlags.Public | BindingFlags.Static);
        Assert.NotNull(method);
        var arguments = new object?[] { "Historia", string.Empty };

        var found = (bool)method.Invoke(null, arguments)!;

        Assert.True(found);
        Assert.Equal("História", arguments[1]);
    }

    [Fact]
    public void TagCatalog_RejectsUnknownTagsInsteadOfCreatingNewSearchValues()
    {
        var catalog = ApiAssembly.GetType("Nexora.Api.Services.ProjectTagCatalog");
        Assert.NotNull(catalog);
        var method = catalog.GetMethod("TryCanonicalize", BindingFlags.Public | BindingFlags.Static);
        Assert.NotNull(method);
        var arguments = new object?[] { "tag-inventada-por-usuario", string.Empty };

        var found = (bool)method.Invoke(null, arguments)!;

        Assert.False(found);
    }

    [Fact]
    public void UploadController_ExposesASeparateRouteForProjectContentImages()
    {
        var action = typeof(UploadsController).GetMethod("UploadProjectContentImage");

        Assert.NotNull(action);
        var route = action.GetCustomAttribute<HttpPostAttribute>();
        Assert.Equal("project-content-image", route?.Template);
    }

    private static IReadOnlyCollection<string> ValidateBlock(string kind, string? text = null, string? url = null)
    {
        var validatorType = ApiAssembly.GetType("Nexora.Api.Services.ProjectContentBlockValidator");
        var requestType = ApiAssembly.GetType("Nexora.Api.Dtos.Requests.ProjectContentBlockRequestDto");
        var kindType = ApiAssembly.GetType("Nexora.Api.Enums.ProjectContentBlockType");

        Assert.NotNull(validatorType);
        Assert.NotNull(requestType);
        Assert.NotNull(kindType);

        var request = Activator.CreateInstance(requestType);
        Assert.NotNull(request);
        requestType.GetProperty("Type")!.SetValue(request, Enum.Parse(kindType, kind));
        requestType.GetProperty("Text")!.SetValue(request, text);
        requestType.GetProperty("Url")!.SetValue(request, url);

        var collectionType = typeof(List<>).MakeGenericType(requestType);
        var requests = (IList)Activator.CreateInstance(collectionType)!;
        requests.Add(request);

        var validate = validatorType.GetMethod("Validate", BindingFlags.Public | BindingFlags.Static);
        Assert.NotNull(validate);

        return Assert.IsAssignableFrom<IReadOnlyCollection<string>>(validate.Invoke(null, [requests]));
    }
}
