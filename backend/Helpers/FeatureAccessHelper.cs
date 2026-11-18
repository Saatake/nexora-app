using Nexora.Api.Enums;
using Nexora.Api.Models;

namespace Nexora.Api.Helpers;

public static class FeatureAccessHelper
{
    private static readonly string[] AiAccessTags = ["ai", "ai_portfolio", "ai_pdf", "pro"];

    public static List<string> ParseTags(string? featureTags)
    {
        if (string.IsNullOrWhiteSpace(featureTags))
            return [];

        return featureTags
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public static bool HasAiAccess(ApplicationUser? user) =>
        user?.RoleType == UserRole.Professor || HasAnyTag(user, AiAccessTags);

    public static bool HasAnyTag(ApplicationUser? user, params string[] expectedTags)
    {
        if (user is null || expectedTags.Length == 0)
            return false;

        var userTags = ParseTags(user.FeatureTags);
        return userTags.Any(tag => expectedTags.Contains(tag, StringComparer.OrdinalIgnoreCase));
    }
}
