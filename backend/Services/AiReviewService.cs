using System.Text.Json;
using Mscc.GenerativeAI;
using Mscc.GenerativeAI.Types;
using Nexora.Api.Data;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Interfaces;
using Nexora.Api.Results;
using Microsoft.EntityFrameworkCore;

namespace Nexora.Api.Services;

public class AiReviewService : IAiReviewService
{
    private readonly AppDbContext _context;
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;

    public AiReviewService(AppDbContext context, IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _apiKey = configuration["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini:ApiKey não configurado.");
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task<AiReviewResult> ReviewProjectAsync(int projectId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            return new AiReviewResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        var textPrompt = $$$"""
            Você é um avaliador acadêmico especializado. Avalie o projeto acadêmico abaixo com notas de 0 a 10 em 5 critérios.
            O documento completo do projeto foi anexado — use-o como principal fonte de análise.

            Metadados do projeto:
            - Título: {{{project.Title}}}
            - Categoria: {{{project.Category}}}
            - Curso: {{{project.Course ?? "não informado"}}}
            - Área: {{{project.Area ?? "não informada"}}}
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
              "feedback": "<análise construtiva em português de 3-4 frases destacando pontos fortes e sugestões de melhoria>"
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
            string feedback = json.GetProperty("feedback").GetString() ?? string.Empty;

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
                    Feedback = feedback
                }
            };
        }
        catch (Exception ex)
        {
            return new AiReviewResult { Succeeded = false, Message = $"Erro ao gerar avaliação: {ex.Message}" };
        }
    }
}
