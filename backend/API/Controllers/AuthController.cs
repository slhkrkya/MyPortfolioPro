using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _cfg;
        public AuthController(IConfiguration cfg) => _cfg = cfg;

        public record LoginRequest(string Username, string Password);
        public record LoginResponse(string Token);

        [HttpPost("login")]
        public ActionResult<LoginResponse> Login([FromBody] LoginRequest req)
        {
            // appsettings.json -> Jwt:AdminUser ile karşılaştır
            var adminUserSection = _cfg.GetSection("Jwt:AdminUser");
            var adminUser = adminUserSection["Username"];
            var adminPass = adminUserSection["Password"];

            if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("Kullanıcı adı/şifre boş olamaz.");

            if (!string.Equals(req.Username, adminUser, StringComparison.Ordinal) ||
                !string.Equals(req.Password, adminPass, StringComparison.Ordinal))
            {
                return Unauthorized("Geçersiz kimlik bilgisi.");
            }

            // Claims (Admin rolü)
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, req.Username),
                new Claim(ClaimTypes.Role, "Admin")
            };

            // Token oluştur
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _cfg["Jwt:Issuer"],
                audience: _cfg["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8), // süreyi istersen değiştir
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new LoginResponse(jwt));
        }
    }
}
