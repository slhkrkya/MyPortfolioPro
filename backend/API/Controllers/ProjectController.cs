using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public ActionResult<List<ProjectDto>> Get()
    {
        var projects = _projectService.GetAll();
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public ActionResult<ProjectDto> Get(int id)
    {
        var project = _projectService.GetById(id);
        if (project == null)
            return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public IActionResult Create([FromBody] ProjectDto project)
    {
        _projectService.Create(project);
        return Ok();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        _projectService.Delete(id);
        return NoContent();
    }

    [HttpPost("upload-cv")]
    public async Task<IActionResult> UploadCv(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Dosya boş");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "UploadedCV");

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var filePath = Path.Combine(uploadsFolder, file.FileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new { fileName = file.FileName });
    }
}
