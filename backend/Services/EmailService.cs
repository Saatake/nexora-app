using SendGrid;
using SendGrid.Helpers.Mail;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        try
        {
            var apiKey = _config["SendGrid:ApiKey"];
            var fromEmail = _config["SendGrid:FromEmail"] ?? "noreply@agora.app";
            var fromName = _config["SendGrid:FromName"] ?? "Ágora App";

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("SendGrid API Key não configurada!");
                throw new Exception("SendGrid API Key não configurada");
            }

            _logger.LogInformation($"Enviando email para {email} usando SendGrid...");
            _logger.LogInformation($"From: {fromEmail} ({fromName})");

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(fromEmail, fromName);
            var to = new EmailAddress(email);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, htmlMessage);

            var response = await client.SendEmailAsync(msg);
            
            _logger.LogInformation($"SendGrid Response Status: {response.StatusCode}");
            
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Body.ReadAsStringAsync();
                _logger.LogError($"SendGrid Error: {body}");
                throw new Exception($"SendGrid falhou: {response.StatusCode} - {body}");
            }

            _logger.LogInformation("Email enviado com sucesso!");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERRO AO ENVIAR EMAIL");
            throw;
        }
    }
}