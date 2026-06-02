using System.Net;
using System.Text.Json;

namespace Nexora.Api.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro não tratado: {Message}", ex.Message);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            object response;

            // dev (expositivo)
            if (_env.IsDevelopment())
            {
                response = new
                {
                    erro = ex.Message,
                    detalhe = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                };
            }
            // prod (genérico)
            else
            {
                response = new
                {
                    erro = "Ocorreu um erro interno no servidor. Tente novamente mais tarde."
                };
            }

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
        }
    }
}