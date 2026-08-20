using Resend;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;
    private readonly ResendClient _resendClient;

    public EmailService(IConfiguration config, ILogger<EmailService> logger, ResendClient resendClient)
    {
        _config = config;
        _logger = logger;
        _resendClient = resendClient;
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        try
        {
            var fromEmail = _config["Resend:FromEmail"] ?? "nao-responda@agora.dev.br";
            var fromName = _config["Resend:FromName"] ?? "Nexora";

            _logger.LogInformation($"Enviando email para {email} usando Resend...");

            // monta o corpo do email
            var message = new EmailMessage
            {
                From = $"{fromName} <{fromEmail}>",
                Subject = subject,
                HtmlBody = htmlMessage
            };
            message.To.Add(email);

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
}