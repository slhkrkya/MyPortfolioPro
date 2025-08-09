namespace Application.Interfaces.Services;
public interface IEmailSender
{
    Task SendAsync(string to, string subject, string htmlBody, string? replyTo = null);
}