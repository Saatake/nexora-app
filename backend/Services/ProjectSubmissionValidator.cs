using Nexora.Api.Dtos.Requests;

namespace Nexora.Api.Services;

public static class ProjectSubmissionValidator
{
    public static IReadOnlyCollection<string> Validate(
        IReadOnlyCollection<ProjectContentBlockRequestDto>? contentBlocks,
        IReadOnlyCollection<string>? selectedTags)
    {
        var errors = ProjectContentBlockValidator.Validate(contentBlocks).ToList();
        if (selectedTags is not null && !ProjectTagCatalog.TryNormalize(selectedTags, out _))
            errors.Add("Escolha os temas disponíveis na lista.");
        return errors;
    }
}
