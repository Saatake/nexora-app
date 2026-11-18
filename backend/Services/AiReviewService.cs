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

            Responda SOMENTE com um JSON válido neste formato exato, sem markdown e sem texto adicional:
            {
              "title": "<título claro e fiel ao trabalho, máximo 150 caracteres>",
              "summary": "<resumo executivo conciso em 2 a 4 frases, máximo 500 caracteres>",
              "description": "<descrição completa e bem estruturada em pelo menos 2 parágrafos explicando problema, objetivo, metodologia/tecnologias e resultados>",
              "category": "<UM dos valores exatos: Tcc | Relatorio | ProjetoEscrito | Upx | IniciacaoCientifica | PesquisaCientifica | Prototipo | ProducaoArtistica | IntervencaoSocial | Negocio | EstudoDeCaso | Outro>",
              "thematicArea": "<UM dos valores exatos: TecnologiaInovacao | NegociosGestao | EngenhariaIndustria | SaudeBiotecnologia | HumanidadesSociedadeDireito | ArtesDesignComunicacao>",
              "tags": ["<escolha de 2 a 6 tags SOMENTE desta lista exata: {{{allowedTags}}}>"]
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

        var title = json.TryGetProperty("title", out var titleProp) ? titleProp.GetString()?.Trim() ?? string.Empty : string.Empty;
        if (title.Length > 150) title = title[..150];

        var summary = json.TryGetProperty("summary", out var sumProp) ? sumProp.GetString()?.Trim() ?? string.Empty : string.Empty;
        if (summary.Length > 500) summary = summary[..500];

        var description = json.TryGetProperty("description", out var descProp) ? descProp.GetString()?.Trim() ?? string.Empty : string.Empty;

        return new ProjectPdfExtractResponseDto
        {
            Title = title,
            Summary = summary,
            Description = description,
            Category = category,
            ThematicArea = thematicArea,
            Tags = tags
        };
    }
}
