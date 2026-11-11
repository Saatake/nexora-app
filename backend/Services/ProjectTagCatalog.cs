using System.Globalization;
using System.Text;
using Nexora.Api.Dtos.Responses;

namespace Nexora.Api.Services;

public static class ProjectTagCatalog
{
    private static readonly ProjectTagOptionDto[] Options =
    [
        .. Group("Humanidades e sociedade", "História", "Educação", "Sociologia", "Filosofia", "Direito", "Literatura", "Cultura", "Psicologia", "Políticas públicas"),
        .. Group("Saúde e ciências da vida", "Saúde", "Saúde mental", "Saúde pública", "Biologia", "Biotecnologia", "Nutrição", "Enfermagem"),
        .. Group("Artes e comunicação", "Arte", "Design", "Fotografia", "Audiovisual", "Música", "Comunicação", "Jornalismo", "Artes cênicas"),
        .. Group("Tecnologia e engenharia", "Programação", "Inteligência artificial", "Análise de dados", "Robótica", "Engenharia", "UX e acessibilidade", "Cibersegurança"),
        .. Group("Negócios e ambiente", "Empreendedorismo", "Gestão", "Marketing", "Finanças", "Sustentabilidade", "Meio ambiente", "Agricultura"),
        .. Group("Métodos e práticas", "Pesquisa de campo", "Revisão bibliográfica", "Entrevista", "Experimentação", "Prototipagem", "Extensão", "Inclusão")
    ];

    private static readonly Dictionary<string, string> CanonicalTags = BuildCanonicalTags();

    public static IReadOnlyList<ProjectTagOptionDto> GetOptions() => Options;

    public static bool TryCanonicalize(string? tag, out string canonical)
    {
        canonical = string.Empty;
        if (string.IsNullOrWhiteSpace(tag)) return false;

        return CanonicalTags.TryGetValue(NormalizeKey(tag), out canonical!);
    }

    public static bool TryNormalize(IEnumerable<string>? tags, out string? normalized)
    {
        normalized = null;
        if (tags is null) return true;

        var values = new List<string>();
        foreach (var tag in tags)
        {
            if (string.IsNullOrWhiteSpace(tag)) continue;
            if (!TryCanonicalize(tag, out var canonical)) return false;
            if (!values.Contains(canonical, StringComparer.OrdinalIgnoreCase)) values.Add(canonical);
        }

        normalized = values.Count == 0 ? null : string.Join(", ", values);
        return true;
    }

    private static ProjectTagOptionDto[] Group(string group, params string[] values) =>
        values.Select(value => new ProjectTagOptionDto { Value = value, Group = group }).ToArray();

    private static Dictionary<string, string> BuildCanonicalTags()
    {
        var map = Options.ToDictionary(option => NormalizeKey(option.Value), option => option.Value);
        AddAliases(map, "História", "Historia", "Historiografia");
        AddAliases(map, "Inteligência artificial", "IA", "AI");
        AddAliases(map, "Análise de dados", "Ciência de dados", "Data science");
        AddAliases(map, "UX e acessibilidade", "UX", "UX/UI", "Acessibilidade");
        AddAliases(map, "Meio ambiente", "Ambiental", "Ecologia");
        return map;
    }

    private static void AddAliases(IDictionary<string, string> map, string canonical, params string[] aliases)
    {
        foreach (var alias in aliases) map[NormalizeKey(alias)] = canonical;
    }

    private static string NormalizeKey(string value)
    {
        var decomposed = value.Trim().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);
        foreach (var character in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
                builder.Append(char.ToLowerInvariant(character));
        }
        return string.Join(' ', builder.ToString().Normalize(NormalizationForm.FormC)
            .Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
    }
}
