namespace Nexora.Api.Dtos.Responses;

public class PortfolioDesignSpecDto
{
    public const int CurrentVersion = 2;
    public const string DefaultCardVariant = "standard";

    public static IReadOnlyList<string> Directions { get; } = Array.AsReadOnly(new[] { "classic-editorial", "studio-grid", "project-spotlight", "field-notes", "gallery-led" });
    public static IReadOnlyList<string> HeroLayouts { get; } = Array.AsReadOnly(new[] { "stacked", "split", "feature" });
    public static IReadOnlyList<string> SectionKinds { get; } = Array.AsReadOnly(new[] { "about", "skills", "projects" });
    public static IReadOnlyList<string> TypographyOptions { get; } = Array.AsReadOnly(new[] { "editorial", "modern", "mono" });
    public static IReadOnlyList<string> ColorOptions { get; } = Array.AsReadOnly(new[] { "forest", "ocean", "sunset" });
    public static IReadOnlyList<string> ImageTreatments { get; } = Array.AsReadOnly(new[] { "natural", "cover", "monochrome" });
    public static IReadOnlyList<string> MediaLayouts { get; } = Array.AsReadOnly(new[] { "inline", "gallery", "feature" });
    public static IReadOnlyList<string> CardVariants { get; } = Array.AsReadOnly(new[] { DefaultCardVariant, "feature", "compact" });

    public int Version { get; set; }
    public string Direction { get; set; } = string.Empty;
    public string HeroLayout { get; set; } = string.Empty;
    public List<string> Sections { get; set; } = new();
    public string Typography { get; set; } = string.Empty;
    public string Colors { get; set; } = string.Empty;
    public string ImageTreatment { get; set; } = string.Empty;
    public string MediaLayout { get; set; } = "inline";
    public List<PortfolioProjectCardDto> ProjectCards { get; set; } = new();

    public static PortfolioDesignSpecDto CreateDefault() => new()
    {
        Version = CurrentVersion,
        Direction = "classic-editorial",
        HeroLayout = "stacked",
        Sections = new() { "about", "skills", "projects" },
        Typography = "editorial",
        Colors = "forest",
        ImageTreatment = "natural",
        MediaLayout = "inline"
    };

    public bool IsValid() =>
        Version == CurrentVersion &&
        Directions.Contains(Direction) &&
        HeroLayouts.Contains(HeroLayout) &&
        Sections is not null &&
        Sections.Count == SectionKinds.Count &&
        Sections.Distinct().Count() == Sections.Count &&
        Sections.All(SectionKinds.Contains) &&
        TypographyOptions.Contains(Typography) &&
        ColorOptions.Contains(Colors) &&
        ImageTreatments.Contains(ImageTreatment) &&
        MediaLayouts.Contains(MediaLayout) &&
        ProjectCards is { Count: <= 12 } &&
        ProjectCards.All(card => card is not null && card.ProjectId > 0 && CardVariants.Contains(card.CardVariant)) &&
        ProjectCards.Select(card => card.ProjectId).Distinct().Count() == ProjectCards.Count;
}

public class PortfolioProjectCardDto
{
    public int ProjectId { get; set; }
    public string CardVariant { get; set; } = string.Empty;
}
