using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
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
        
        // troquei porque o gmail bloqueou o envio de emails por suspeita de spam
        var fromEmail = _config["EmailSettings:From"]; 
    
        var message = new MimeMessage();
        
        message.From.Add(new MailboxAddress("Ágora App", fromEmail)); 
        
        message.To.Add(MailboxAddress.Parse(email));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlMessage };

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(username, password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }