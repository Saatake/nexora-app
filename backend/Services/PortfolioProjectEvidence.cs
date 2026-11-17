using Nexora.Api.Models;

namespace Nexora.Api.Services;

public static class PortfolioProjectEvidence
{
    public static object Create(Project project, string ownerId)
    {
        if (!string.Equals(project.UserId, ownerId, StringComparison.Ordinal))
            throw new InvalidOperationException("O projeto não pertence ao autor do portfólio.");

        return new
        {
            projectId = project.Id,
            title = Limit(project.Title, 160),
            summary = Limit(project.Summary, 500),
            description = Limit(project.Description, 1200),
            area = Limit(project.ThematicArea.ToString(), 100),
            category = Limit(project.Category.ToString(), 100),
            tags = Limit(project.Tags, 200),
            hasCover = !string.IsNullOrWhiteSpace(project.ImageUrl),
            ownerRole = Limit(project.AuthorRole, 100),
            ownerContribution = Limit(project.AuthorContribution, 800),
            contentBlocks = project.ContentBlocks
                .OrderBy(block => block.SortOrder)
                .ThenBy(block => block.Id)
                .Take(6)
                .Select(block => new
                {
                    type = block.Type.ToString(),
                    text = Limit(block.Text, 800),
                    url = Limit(block.Url, 400),
                    caption = Limit(block.Caption, 200),
                    block.SortOrder
                }),
            collaborators = project.Collaborators
                .Take(8)
                .Select(collaborator => new
                {
                    role = Limit(collaborator.Role, 100),
                    contribution = Limit(collaborator.Contribution, 400)
                })
        };
    }

    private static string Limit(string? value, int maxLength)
    {
        var text = value?.Trim() ?? string.Empty;
        return text.Length <= maxLength ? text : text[..maxLength];
    }
}
