using System.Text.Json;
using Mscc.GenerativeAI;
using Mscc.GenerativeAI.Types;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Results;
using Microsoft.EntityFrameworkCore;
using Nexora.Api.Models;

namespace Nexora.Api.Services;

public class AiReviewService : IAiReviewService
{
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;

    public AiReviewService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _apiKey = configuration["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini:ApiKey não configurado.");
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task<AiReviewResult> ReviewProjectAsync(Project project)
    {
        if(project == null) {
            throw new ArgumentNullException(nameof(project), "O projeto enviado para a avaliação não pode ser nulo.");
        }

        var textPrompt = $$$"""
            Você é um avaliador acadêmico especializado. Avalie o projeto acadêmico abaixo com notas de 0 a 10 em 5 critérios.
            O documento completo do projeto foi anexado — use-o como principal fonte de análise.

            Metadados do projeto:
            - Título: {{{project.Title}}}
            - Categoria: {{{project.Category}}}
            - Área Temática: {{{project.ThematicArea}}}
            - Tags: {{{project.Tags ?? "não informadas"}}}
            - Resumo: {{{project.Summary ?? "não informado"}}}
            - Descrição: {{{project.Description}}}

            Critérios de avaliação:
            1. Relevância (relevance): pertinência do tema e impacto potencial
            2. Qualidade (quality): rigor técnico, profundidade e embasamento teórico
            3. Metodologia (methodology): clareza e adequação da metodologia utilizada
            4. Apresentação (presentation): organização, clareza e qualidade da escrita
            5. Inovação (innovation): originalidade e contribuição nova ao campo

            Responda SOMENTE com um JSON válido neste formato exato, sem markdown, sem texto adicional:
            {
              "relevance": <nota 0-10>,
              "quality": <nota 0-10>,
              "methodology": <nota 0-10>,
              "presentation": <nota 0-10>,
              "innovation": <nota 0-10>,
              "feedback": {
                "pontos_fortes": "<análise detalhada e aprofundada dos pontos fortes do projeto. Escreva pelo menos 2 parágrafos.>",
                "pontos_melhoria": "<críticas construtivas e sugestões práticas de como o aluno pode evoluir o projeto. Escreva pelo menos 2 parágrafos.>",
                "conclusao": "<uma síntese geral do parecer técnico>"
            }
        }
        """;

        try
        {
            var googleAi = new GoogleAI(_apiKey);
            var model = googleAi.GenerativeModel("gemini-2.5-flash-lite");

            GenerateContentResponse response;

            // tenta enviar o PDF como inline data para análise mais profunda
            if (!string.IsNullOrWhiteSpace(project.FileUrl))
            {
                try
                {
                    var pdfBytes = await _httpClient.GetByteArrayAsync(project.FileUrl);
                    var pdfBase64 = Convert.ToBase64String(pdfBytes);

                    var request = new GenerateContentRequest(textPrompt);
                    request.AddPart(new InlineData { MimeType = "application/pdf", Data = pdfBase64 });
                    response = await model.GenerateContent(request);
                }
                catch
                {
                    // fallback: sem o PDF, analisa só pelos metadados
                    response = await model.GenerateContent(textPrompt);
                }
            }
            else
            {
                response = await model.GenerateContent(textPrompt);
            }
            var raw = response.Text?.Trim() ?? string.Empty;

            // remover blocos de markdown caso venham
            if (raw.StartsWith("```"))
            {
                raw = string.Join('\n', raw.Split('\n').Skip(1));
                raw = raw.TrimEnd('`').Trim();
            }

            var json = JsonSerializer.Deserialize<JsonElement>(raw);

            double relevance = json.GetProperty("relevance").GetDouble();
            double quality = json.GetProperty("quality").GetDouble();
            double methodology = json.GetProperty("methodology").GetDouble();
            double presentation = json.GetProperty("presentation").GetDouble();
            double innovation = json.GetProperty("innovation").GetDouble();

            var feedbackObj = json.GetProperty("feedback");
            string pontosFortes = feedbackObj.GetProperty("pontos_fortes").GetString() ?? String.Empty;
            string pontosMelhoria = feedbackObj.GetProperty("pontos_melhoria").GetString() ?? String.Empty;
            string conclusao = feedbackObj.GetProperty("conclusao").GetString() ?? String.Empty;

            string feedbackFormatado = $"### Pontos Fortes\n{pontosFortes}\n\n### Pontos de Melhoria\n{pontosMelhoria}\n\n### Conclusão\n{conclusao}";

            double average = Math.Round((relevance + quality + methodology + presentation + innovation) / 5.0, 2);

            return new AiReviewResult
            {
                Succeeded = true,
                Data = new AiReviewResponseDto
                {
                    Relevance = relevance,
                    Quality = quality,
                    Methodology = methodology,
                    Presentation = presentation,
                    Innovation = innovation,
                    Average = average,
                    Feedback = feedbackFormatado
                }
            };
        }
        catch (Exception ex)
        {
            return new AiReviewResult { Succeeded = false, Message = $"Erro ao gerar avaliação: {ex.Message}" };
        }
    }

    public async Task<ProjectPdfExtractResponseDto> ExtractFromPdfAsync(byte[] pdfBytes, string fileName)
    {
        if (pdfBytes == null || pdfBytes.Length == 0)
            throw new ArgumentException("O arquivo PDF enviado está vazio.", nameof(pdfBytes));

        var allowedTags = string.Join(" | ", ProjectTagCatalog.GetOptions().Select(o => o.Value));

        var prompt = $$$"""
            Você é um assistente acadêmico da plataforma Ágora. Leia o documento PDF anexado (nome do arquivo: {{{fileName}}}) e extraia os dados estruturados do projeto para preencher o formulário de publicação.
            Não invente informações que não estejam no documento. Escreva sempre em português do Brasil.
            Gere de 2 a 4 blocos do tipo "Text" em contentBlocks dividindo as partes mais importantes do trabalho (como Problema e Contexto, Metodologia e Arquitetura, e Resultados e Discussão) para compor a vitrine do projeto.
            Inclua blocos do tipo "Link" APENAS se houver URLs https:// reais e explícitas escritas no PDF (nunca invente links e não inclua links do YouTube).

            Responda SOMENTE com um JSON válido neste formato exato, sem markdown e sem texto adicional:
            {
              "title": "<título claro e fiel ao trabalho, máximo 150 caracteres>",
              "summary": "<resumo executivo conciso em 1 a 2 frases curtas, ESTRITAMENTE no máximo 190 caracteres>",
              "description": "<visão geral bem estruturada em 2 a 3 parágrafos explicando o contexto, objetivo e conclusão, máximo 4500 caracteres>",
              "category": "<UM dos valores exatos: Tcc | Relatorio | ProjetoEscrito | Upx | IniciacaoCientifica | PesquisaCientifica | Prototipo | ProducaoArtistica | IntervencaoSocial | Negocio | EstudoDeCaso | Outro>",
              "thematicArea": "<UM dos valores exatos: TecnologiaInovacao | NegociosGestao | EngenhariaIndustria | SaudeBiotecnologia | HumanidadesSociedadeDireito | ArtesDesignComunicacao>",
              "tags": ["<escolha de 2 a 6 tags SOMENTE desta lista exata: {{{allowedTags}}}>"],
              "advisor": "<nome do professor orientador se constar no PDF (ex: Prof. Dr. Nome), ou string vazia se não constar, máximo 110 caracteres>",
              "authorRole": "<papel principal do autor no projeto (ex: Autor e Pesquisador, Desenvolvedor Full-Stack, Engenheiro Projetista), máximo 90 caracteres>",
              "authorContribution": "<síntese em 1 a 2 frases das principais atividades realizadas no desenvolvimento do trabalho, máximo 750 caracteres>",
              "githubLink": "<URL https://github.com/... explícita encontrada no PDF, ou string vazia>",
              "contentBlocks": [
                {
                  "type": "Text",
                  "caption": "<título curto da seção, ex: Problema e Justificativa | Metodologia e Tecnologias | Resultados Obtidos, máximo 120 caracteres>",
                  "text": "<conteúdo detalhado da seção extraído do PDF em 1 a 3 parágrafos, máximo 3500 caracteres>"
                },
                {
                  "type": "Link",
                  "caption": "<nome descritivo do link externo encontrado no PDF, máximo 120 caracteres>",
                  "url": "<URL https://... explícita encontrada no documento>"
                }
              ]
            }
            """;

        var googleAi = new GoogleAI(_apiKey);
        var model = googleAi.GenerativeModel("gemini-2.5-flash-lite");

        var request = new GenerateContentRequest(prompt);
        request.AddPart(new InlineData
        {
            MimeType = "application/pdf",
            Data = Convert.ToBase64String(pdfBytes)
        });

        var response = await model.GenerateContent(request);
        var raw = response.Text?.Trim() ?? string.Empty;

        if (raw.StartsWith("```"))
        {
            raw = string.Join('\n', raw.Split('\n').Skip(1));
            raw = raw.TrimEnd('`').Trim();
        }

        var json = JsonSerializer.Deserialize<JsonElement>(raw);

        var rawCategory = json.TryGetProperty("category", out var catProp) ? catProp.GetString() : null;
        var category = Enum.TryParse<ProjectCategory>(rawCategory, true, out var parsedCat)
            ? parsedCat.ToString()
            : ProjectCategory.Tcc.ToString();

        var rawArea = json.TryGetProperty("thematicArea", out var areaProp) ? areaProp.GetString() : null;
        var thematicArea = Enum.TryParse<ThematicArea>(rawArea, true, out var parsedArea)
            ? parsedArea.ToString()
            : ThematicArea.TecnologiaInovacao.ToString();

        var tags = new List<string>();
        if (json.TryGetProperty("tags", out var tagsProp) && tagsProp.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in tagsProp.EnumerateArray())
            {
                if (ProjectTagCatalog.TryCanonicalize(item.GetString(), out var canonical) &&
                    !tags.Contains(canonical, StringComparer.OrdinalIgnoreCase) &&
                    tags.Count < 6)
                {
                    tags.Add(canonical);
                }
            }
        }

        var title = TruncateAtWord(json.TryGetProperty("title", out var titleProp) ? titleProp.GetString() : null, 200);
        var summary = TruncateAtWord(json.TryGetProperty("summary", out var sumProp) ? sumProp.GetString() : null, 200);
        var description = TruncateAtWord(json.TryGetProperty("description", out var descProp) ? descProp.GetString() : null, 5000);

        var advisorRaw = TruncateAtWord(json.TryGetProperty("advisor", out var advProp) ? advProp.GetString() : null, 120);
        var advisor = string.IsNullOrWhiteSpace(advisorRaw) ? null : advisorRaw;

        var authorRoleRaw = TruncateAtWord(json.TryGetProperty("authorRole", out var roleProp) ? roleProp.GetString() : null, 100);
        var authorRole = string.IsNullOrWhiteSpace(authorRoleRaw) ? null : authorRoleRaw;

        var authorContributionRaw = TruncateAtWord(json.TryGetProperty("authorContribution", out var contribProp) ? contribProp.GetString() : null, 800);
        var authorContribution = string.IsNullOrWhiteSpace(authorContributionRaw) ? null : authorContributionRaw;

        var rawGithub = json.TryGetProperty("githubLink", out var ghProp) ? ghProp.GetString()?.Trim() : null;
        var githubLink = IsSafeHttpsUrl(rawGithub) && rawGithub!.Contains("github.com", StringComparison.OrdinalIgnoreCase)
            ? rawGithub
            : null;

        var contentBlocks = new List<ProjectContentBlockResponseDto>();
        if (json.TryGetProperty("contentBlocks", out var blocksProp) && blocksProp.ValueKind == JsonValueKind.Array)
        {
            foreach (var blockItem in blocksProp.EnumerateArray())
            {
                if (contentBlocks.Count >= 10 || blockItem.ValueKind != JsonValueKind.Object)
                    break;

                var blockType = blockItem.TryGetProperty("type", out var typeProp) ? typeProp.GetString()?.Trim() : null;
                var captionRaw = TruncateAtWord(blockItem.TryGetProperty("caption", out var capProp) ? capProp.GetString() : null, 300);
                var caption = string.IsNullOrWhiteSpace(captionRaw) ? null : captionRaw;

                if (string.Equals(blockType, "Text", StringComparison.OrdinalIgnoreCase))
                {
                    var textRaw = TruncateAtWord(blockItem.TryGetProperty("text", out var txtProp) ? txtProp.GetString() : null, 5000);
                    if (!string.IsNullOrWhiteSpace(textRaw))
                    {
                        contentBlocks.Add(new ProjectContentBlockResponseDto
                        {
                            Type = "Text",
                            Caption = caption,
                            Text = textRaw,
                            SortOrder = contentBlocks.Count
                        });
                    }
                }
                else if (string.Equals(blockType, "Link", StringComparison.OrdinalIgnoreCase))
                {
                    var urlRaw = blockItem.TryGetProperty("url", out var urlProp) ? urlProp.GetString()?.Trim() : null;
                    if (IsSafeHttpsUrl(urlRaw) &&
                        !ProjectContentBlockValidator.TryGetYouTubeVideoId(urlRaw, out _) &&
                        !string.Equals(urlRaw, githubLink, StringComparison.OrdinalIgnoreCase))
                    {
                        contentBlocks.Add(new ProjectContentBlockResponseDto
                        {
                            Type = "Link",
                            Caption = caption,
                            Url = urlRaw,
                            SortOrder = contentBlocks.Count
                        });
                    }
                }
            }
        }

        return new ProjectPdfExtractResponseDto
        {
            Title = title,
            Summary = summary,
            Description = description,
            Category = category,
            ThematicArea = thematicArea,
            Tags = tags,
            Advisor = advisor,
            AuthorRole = authorRole,
            AuthorContribution = authorContribution,
            GithubLink = githubLink,
            ContentBlocks = contentBlocks
        };
    }

    private static bool IsSafeHttpsUrl(string? value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
        uri.Scheme == Uri.UriSchemeHttps &&
        uri.IsDefaultPort &&
        string.IsNullOrEmpty(uri.UserInfo);

    private static string TruncateAtWord(string? value, int maxLength)
    {
        var trimmed = value?.Trim() ?? string.Empty;
        if (trimmed.Length <= maxLength)
            return trimmed;

        var slice = trimmed[..maxLength];
        var lastSpace = slice.LastIndexOf(' ');
        return (lastSpace > maxLength * 2 / 3 ? slice[..lastSpace] : slice).TrimEnd('.', ',', ';', ':', ' ');
    }
}
