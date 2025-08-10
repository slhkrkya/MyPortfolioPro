using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SiteProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public SiteProfileController(ApplicationDbContext context) => _context = context;

        public class SiteProfileDto
        {
            public string FullName { get; set; } = "";
            public string Tagline  { get; set; } = "";
            public string[] About  { get; set; } = Array.Empty<string>();
            public string Github    { get; set; } = "";
            public string LinkedIn  { get; set; } = "";
            public string Instagram { get; set; } = "";
            public string Email     { get; set; } = "";
        }

        private static SiteProfileDto ToDto(SiteProfile p) => new()
        {
            FullName = p.FullName,
            Tagline  = p.Tagline,
            About    = p.About ?? Array.Empty<string>(),
            Github   = p.Github,
            LinkedIn = p.LinkedIn,
            Instagram= p.Instagram,
            Email    = p.Email
        };

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Get()
        {
            var p = await _context.SiteProfiles.FindAsync(1);
            if (p == null) p = new SiteProfile { Id = 1 }; // boş default
            return Ok(ToDto(p));
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromBody] SiteProfileDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var p = await _context.SiteProfiles.FindAsync(1);
            if (p == null)
            {
                p = new SiteProfile { Id = 1 };
                _context.SiteProfiles.Add(p);
            }

            p.FullName = dto.FullName?.Trim() ?? "";
            p.Tagline  = dto.Tagline?.Trim() ?? "";
            p.About    = dto.About ?? Array.Empty<string>();
            p.Github   = dto.Github?.Trim() ?? "";
            p.LinkedIn = dto.LinkedIn?.Trim() ?? "";
            p.Instagram= dto.Instagram?.Trim() ?? "";
            p.Email    = dto.Email?.Trim() ?? "";

            await _context.SaveChangesAsync();
            return Ok(ToDto(p));
        }
    }
}