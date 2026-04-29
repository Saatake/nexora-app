using System.Net;
using System.Net.Mail;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var host = _config["EmailSettings:Host"];
        var port = int.Parse(_config["EmailSettings:Port"]!);
        var username = _config["EmailSettings:Username"];
        var password = _config["EmailSettings:Password"];

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(username!, "Ágora App"),
            Subject = subject,
            Body = htmlMessage,
            IsBodyHtml = true
        };
        
        mailMessage.To.Add(email);
        await client.SendMailAsync(mailMessage);
    }
}