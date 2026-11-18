namespace Nexora.Api.Dtos;

public static class PortfolioSkills
{
    public const int MaxCount = 10;
    public const int MaxLength = 80;

    // Use the same bounded comma-delimited tokens for drafts, storage and reads.
    public static List<string> Normalize(IEnumerable<string?> entries) => entries
        .SelectMany(entry => (entry ?? string.Empty).Split(','))
        .Select(skill => skill.Trim())
        .Select(skill => skill.Length > MaxLength ? skill[..MaxLength].Trim() : skill)
        .Where(skill => skill.Length > 0)
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .Take(MaxCount)
        .ToList();
}
