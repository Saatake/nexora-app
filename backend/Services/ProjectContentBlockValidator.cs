using System.Text.RegularExpressions;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Enums;

namespace Nexora.Api.Services;

public static partial class ProjectContentBlockValidator
{
    public const int MaximumBlocks = 30;
    private const int MaximumVideoIdLength = 11;

    public static IReadOnlyCollection<string> Validate(IReadOnlyCollection<ProjectContentBlockRequestDto>? blocks)
    {
        if (blocks is null) return [];

        var errors = new List<string>();
        if (blocks.Count > MaximumBlocks)
            errors.Add($"Um projeto pode ter no máximo {MaximumBlocks} blocos de conteúdo.");
        if (blocks.Count(block => block.Type == ProjectContentBlockType.YouTube) > 1)
            errors.Add("Um projeto pode ter apenas um vídeo pitch do YouTube.");

        foreach (var block in blocks)
        {
            if (block.SortOrder < 0)
                errors.Add("A ordem do conteúdo é inválida.");
            if (block.Caption?.Length > 300)
                errors.Add("A legenda pode ter no máximo 300 caracteres.");

            switch (block.Type)
            {
                case ProjectContentBlockType.Text:
                    if (string.IsNullOrWhiteSpace(block.Text))
                        errors.Add("Blocos de texto precisam ter conteúdo.");
                    if (block.Text?.Length > 5000)
                        errors.Add("O texto pode ter no máximo 5000 caracteres.");
                    break;
                case ProjectContentBlockType.Image:
                case ProjectContentBlockType.Document:
                case ProjectContentBlockType.Link:
                    if (!IsSecureHttpUrl(block.Url))
                        errors.Add("Cada imagem, documento ou link precisa ter uma URL HTTPS válida.");
                    break;
                case ProjectContentBlockType.YouTube:
                    if (!TryGetYouTubeVideoId(block.Url, out _))
                        errors.Add("Informe um link válido de vídeo do YouTube.");
                    break;
                default:
                    errors.Add("Tipo de conteúdo não suportado.");
                    break;
            }
        }

        return errors;
    }

    public static bool TryGetYouTubeVideoId(string? value, out string videoId)
    {
        videoId = string.Empty;
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) ||
            uri.Scheme != Uri.UriSchemeHttps || !uri.IsDefaultPort || !string.IsNullOrEmpty(uri.UserInfo))
            return false;

        var host = uri.Host.ToLowerInvariant();
        if (host == "youtu.be")
        {
            videoId = uri.AbsolutePath.Trim('/').Split('/').FirstOrDefault() ?? string.Empty;
            return IsValidVideoId(videoId);
        }

        if (host is not ("youtube.com" or "www.youtube.com" or "m.youtube.com" or "youtube-nocookie.com" or "www.youtube-nocookie.com"))
            return false;

        if (uri.AbsolutePath.Equals("/watch", StringComparison.OrdinalIgnoreCase))
            videoId = System.Web.HttpUtility.ParseQueryString(uri.Query)["v"] ?? string.Empty;
        else
        {
            var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (segments.Length == 2 && segments[0] is "embed" or "shorts" or "live")
                videoId = segments[1];
        }

        return IsValidVideoId(videoId);
    }

    public static string? GetYouTubeEmbedUrl(string? value) =>
        TryGetYouTubeVideoId(value, out var id) ? $"https://www.youtube-nocookie.com/embed/{id}" : null;

    private static bool IsSecureHttpUrl(string? value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
        uri.Scheme == Uri.UriSchemeHttps &&
        uri.IsDefaultPort &&
        string.IsNullOrEmpty(uri.UserInfo);

    private static bool IsValidVideoId(string value) =>
        value.Length == MaximumVideoIdLength && VideoIdRegex().IsMatch(value);

    [GeneratedRegex("^[A-Za-z0-9_-]{11}$", RegexOptions.CultureInvariant)]
    private static partial Regex VideoIdRegex();
}
