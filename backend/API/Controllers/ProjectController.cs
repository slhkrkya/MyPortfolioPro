using Application.DTOs;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IGitHubImportService _gitHubImportService;

        // Tek constructor — iki servisi de burada alıyoruz
        public ProjectsController(IProjectService projectService, IGitHubImportService gitHubImportService)
        {
            _projectService = projectService;
            _gitHubImportService = gitHubImportService;
        }

        // Tüm projeleri getir
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _projectService.GetAllAsync();
            return Ok(projects);
        }

        // ID ile proje getir
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var project = await _projectService.GetByIdAsync(id);
            return project == null ? NotFound() : Ok(project);
        }

        // Yeni proje oluştur
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        {
            var created = await _projectService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // Proje güncelle
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto dto)
        {
            if (id != dto.Id) return BadRequest("ID uyuşmuyor.");
            var result = await _projectService.UpdateAsync(dto);
            return result ? NoContent() : NotFound();
        }

        // Proje sil
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // sadece admin
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _projectService.DeleteAsync(id);
            return ok ? NoContent() : NotFound();
        }

        // GitHub'dan proje import et
        [HttpPost("import/github")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportFromGitHub([FromQuery] string username, [FromQuery] int take = 6)
        {
            if (string.IsNullOrWhiteSpace(username))
                return BadRequest("Kullanıcı adı zorunlu.");

            var count = await _gitHubImportService.ImportUserReposAsync(username, take);
            return Ok(new { imported = count });
        }
    }
}
