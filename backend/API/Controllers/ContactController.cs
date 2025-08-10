using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Application.Interfaces.Services;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.RateLimiting;
using System.Net;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("contact")]
public class ContactController : ControllerBase
{
    private readonly IEmailSender _email;
    private readonly IConfiguration _cfg;

    public ContactController(IEmailSender email, IConfiguration cfg)
    {
        _email = email;
        _cfg = cfg;
    }

    public class ContactRequest
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = "";

        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; } = "";

        // opsiyonel telefon
        [MaxLength(20)]
        [RegularExpression(@"^[0-9+() \-]{0,20}$")]
        public string? Phone { get; set; }

        [Required, MinLength(10), MaxLength(4000)]
        public string Message { get; set; } = "";

        public string? Honeypot { get; set; } // botlar için gizli alan
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("contact")]
    public async Task<IActionResult> Create([FromBody] ContactRequest req)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // honeypot doluysa sessizce OK dön (bot)
        if (!string.IsNullOrWhiteSpace(req.Honeypot))
            return Ok(new { ok = true });

        // veriler
        var name = req.Name.Trim();
        var email = req.Email.Trim();
        var phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim();
        var message = req.Message.Trim();

        var to = _cfg["Email:ToAddress"] ?? _cfg["Email:FromAddress"]!;
        var subject = $"New contact from {name}";

        string Encode(string s) => WebUtility.HtmlEncode(s);

        var phoneRow = phone is null ? "" : $"<b>Phone:</b> {Encode(phone)}<br/>";

        var body = $@"
            <h3>New message</h3>
            <p>
              <b>Name:</b> {Encode(name)}<br/>
              <b>Email:</b> {Encode(email)}<br/>
              {phoneRow}
              <b>IP:</b> {HttpContext.Connection.RemoteIpAddress}<br/>
              <b>User-Agent:</b> {Encode(Request.Headers.UserAgent.ToString())}
            </p>
            <pre style=""white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px"">
{Encode(message)}
            </pre>";

        // reply-to olarak gönderen e-postasını ekle
        await _email.SendAsync(to, subject, body, replyTo: email);

        return Ok(new { ok = true });
    }
}