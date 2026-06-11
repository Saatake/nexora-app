using System.Text.Json;
using Mscc.GenerativeAI;
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

    public AiReviewService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _apiKey = configuration["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini:ApiKey não configurado.");
    }

    public async Task<AiReviewResult> ReviewProjectAsync(int projectId)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            return new AiReviewResult { Succeeded = false, IsNotFound = true, Message = "projeto não encontrado." };

        var prompt = $$$"""
            Você é um avaliador acadêmico especializado. Avalie o projeto acadêmico abaixo com notas de 0 a 10 em 5 critérios.

            Projeto:
            - Título: {{{project.Title}}}
            - Categoria: {{{project.Category}}}
            - Curso: {{{project.Course ?? "não informado"}}}
            - Área: {{{project.Area ?? "não informada"}}}
            - Resumo: {{{project.Summary ?? "não informado"}}}
            - Descrição: {{{project.Description}}}

            Responda SOMENTE com um JSON válido neste formato exato, sem markdown, sem texto adicional:
            {
              "relevance": <nota 0-10>,
              "quality": <nota 0-10>,
              "methodology": <nota 0-10>,
              "presentation": <nota 0-10>,
              "innovation": <nota 0-10>,
              "feedback": "<parágrafo em português com análise construtiva de 2-3 frases>"
            }
            """;

        try
        {
            var googleAi = new GoogleAI(_apiKey);
            var model = googleAi.GenerativeModel("gemini-1.5-flash");
            var response = await model.GenerateContent(prompt);
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
