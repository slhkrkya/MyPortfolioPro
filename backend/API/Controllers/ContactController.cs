using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Application.Interfaces.Services;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.RateLimiting;
using System.Net;
using System.Text.RegularExpressions;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("contact")] // IP başına 1/dk
public class ContactController : ControllerBase
{
    private readonly IEmailSender _email;
    private readonly IConfiguration _cfg;
    private static readonly Regex UrlRegex = new(@"https?://", RegexOptions.IgnoreCase | RegexOptions.Compiled);

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

        [MaxLength(20)]
        [RegularExpression(@"^[0-9+() \-]{0,20}$")]
        public string? Phone { get; set; }

        [Required, MinLength(10), MaxLength(4000)]
        public string Message { get; set; } = "";

        public string? Honeypot { get; set; }
    }

    [HttpPost]
    [AllowAnonymous]
    [Consumes("application/json")]
    [RequestSizeLimit(16 * 1024)] // 16KB JSON sınırı
    [EnableRateLimiting("contact")]
    public async Task<IActionResult> Create([FromBody] ContactRequest req)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // 1) Honeypot: doluysa sessizce OK
        if (!string.IsNullOrWhiteSpace(req.Honeypot))
            return Ok(new { ok = true });

        // 2) Temizle/normalize
        var name = (req.Name ?? "").Trim();
        var email = (req.Email ?? "").Trim();
        var phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone!.Trim();
        var message = (req.Message ?? "").Trim();

        // 3) Basit spam heuristikleri: çok link, tekrarlı karakter, tek kelimelik vb.
        int linkCount = UrlRegex.Matches(message).Count;
        bool looksLikeSpam =
            linkCount > 3 ||
            message.Length < 10 ||
            HasLongRepeatedChars(message, 12);

        if (looksLikeSpam)
            return Ok(new { ok = true }); // sessiz drop

        // 4) Mail içerik
        string Enc(string s) => WebUtility.HtmlEncode(s);
        var to = _cfg["Email:ToAddress"] ?? _cfg["Email:FromAddress"]!;
        var subject = $"New contact from {name}";

        var phoneRow = phone is null ? "" : $"<b>Phone:</b> {Enc(phone)}<br/>";

        var body = $@"
<h3>New message</h3>
<p>
  <b>Name:</b> {Enc(name)}<br/>
  <b>Email:</b> {Enc(email)}<br/>
  {phoneRow}
  <b>IP:</b> {HttpContext.Connection.RemoteIpAddress}<br/>
  <b>User-Agent:</b> {Enc(Request.Headers.UserAgent.ToString())}
</p>
<pre style=""white-space:pre-wrap;border:1px solid #eee;padding:12px;border-radius:8px"">
{Enc(message)}
</pre>";

        // 5) Gönder (hata durumunda kullanıcıya detayı sızdırma)
        try
        {
            await _email.SendAsync(to, subject, body, replyTo: email);
        }
        catch (Exception)
        {
            // TODO: log
            // Botların deneme-yanılmasına sinyal vermemek için yine OK dönüyoruz
            return Ok(new { ok = true });
        }

        return Ok(new { ok = true });
    }

    private static bool HasLongRepeatedChars(string input, int maxRun)
    {
        if (string.IsNullOrEmpty(input)) return false;
        int run = 1;
        for (int i = 1; i < input.Length; i++)
        {
            run = (input[i] == input[i - 1]) ? run + 1 : 1;
            if (run >= maxRun) return true;
        }
        return false;
    }
}