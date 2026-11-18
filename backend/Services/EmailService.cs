using Resend;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;
    private readonly ResendClient _resendClient;
    private readonly IWebHostEnvironment _env;

    public EmailService(
        IConfiguration config,
        ILogger<EmailService> logger,
        ResendClient resendClient,
        IWebHostEnvironment env)
    {
        _config = config;
        _logger = logger;
        _resendClient = resendClient;
        _env = env;
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        try
        {
            var fromEmail = _config["Resend:FromEmail"] ?? "nao-responda@agora.dev.br";
            var fromName = _config["Resend:FromName"] ?? "Ágora";

            _logger.LogInformation("Enviando email para {Email} usando Resend...", email);

            // monta o corpo do email
            var message = new EmailMessage
            {
                From = $"{fromName} <{fromEmail}>",
                Subject = subject,
                HtmlBody = htmlMessage
            };
            message.To.Add(email);

            if (htmlMessage.Contains("cid:agora-logo", StringComparison.OrdinalIgnoreCase))
            {
                var logoPath = ResolveLogoPath();
                if (logoPath is not null)
                {
                    var logoBytes = await File.ReadAllBytesAsync(logoPath);
                    message.Attachments =
                    [
                        new EmailAttachment
                        {
                            Filename = "agora-logo-mark.png",
                            Content = logoBytes,
                            ContentType = "image/png",
                            ContentId = "agora-logo"
                        }
                    ];
                }
            }

            // Dispara o e-mail
            await _resendClient.EmailSendAsync(message);
            
            _logger.LogInformation("Email enviado com sucesso!");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERRO AO ENVIAR EMAIL");
            throw;
        }
    }

    private string? ResolveLogoPath()
    {
        var candidates = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Assets", "agora-logo-mark.png"),
            Path.Combine(_env.ContentRootPath, "Assets", "agora-logo-mark.png")
        };

        return candidates.FirstOrDefault(File.Exists);
    }
}