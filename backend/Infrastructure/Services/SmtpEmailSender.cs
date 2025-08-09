using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _cfg;
    private readonly ILogger<SmtpEmailSender>? _logger;

    public SmtpEmailSender(IConfiguration cfg, ILogger<SmtpEmailSender>? logger = null)
    {
        _cfg = cfg;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string htmlBody, string? replyTo = null)
    {
        // Basit header injection koruması
        if (HasCrlf(to) || HasCrlf(replyTo) || HasCrlf(subject))
            throw new ArgumentException("Invalid header characters in input.");

        var fromAddr = _cfg["Email:FromAddress"] ?? throw new InvalidOperationException("Email:FromAddress missing");
        var fromName = _cfg["Email:FromName"] ?? fromAddr;

        using var msg = new MailMessage
        {
            From = new MailAddress(fromAddr, fromName, Encoding.UTF8),
            Subject = subject,
            SubjectEncoding = Encoding.UTF8,
            BodyEncoding = Encoding.UTF8,
            IsBodyHtml = true
        };

        msg.To.Add(new MailAddress(to));

        if (!string.IsNullOrWhiteSpace(replyTo))
            msg.ReplyToList.Add(new MailAddress(replyTo!));

        // text/plain alternatifi (deliverability için iyi)
        var plainAlt = HtmlToText(htmlBody);
        msg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(plainAlt, Encoding.UTF8, "text/plain"));
        msg.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(htmlBody, Encoding.UTF8, "text/html"));

        var host = _cfg["Email:Smtp:Host"] ?? throw new InvalidOperationException("Email:Smtp:Host missing");
        var port = int.Parse(_cfg["Email:Smtp:Port"] ?? "587");
        var user = _cfg["Email:Smtp:User"] ?? throw new InvalidOperationException("Email:Smtp:User missing");
        var pass = _cfg["Email:Smtp:Pass"] ?? throw new InvalidOperationException("Email:Smtp:Pass missing");

        // Geriye dönük: UseStartTls varsa onu da oku; yoksa EnableSsl'e bak
        var enableSsl = _cfg["Email:Smtp:EnableSsl"] ?? _cfg["Email:Smtp:UseStartTls"] ?? "true";

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = bool.Parse(enableSsl),
            Timeout = 15000 // ms
        };

        try
        {
            await client.SendMailAsync(msg);
        }
        catch (SmtpException ex)
        {
            _logger?.LogError(ex, "SMTP send failed (host:{Host}, port:{Port})", host, port);
            throw;
        }
    }

    private static bool HasCrlf(string? s) => s is not null && (s.Contains("\r") || s.Contains("\n"));

    private static string HtmlToText(string html)
    {
        if (string.IsNullOrWhiteSpace(html)) return string.Empty;
        var text = Regex.Replace(html, "<.*?>", " ");
        return WebUtility.HtmlDecode(text).Trim();
    }
}