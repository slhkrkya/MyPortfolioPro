using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DocumentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string fileName)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Dosya yok.");

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);

            var extension = Path.GetExtension(file.FileName);
            var document = new Document
            {
                FileName = fileName + extension,
                FileData = memoryStream.ToArray(),
                UploadedAt = DateTime.UtcNow
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return Ok(document);
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var docs = _context.Documents
                .Select(d => new
                {
                    d.Id,
                    d.FileName,
                    d.UploadedAt
                })
                .ToList();

            return Ok(docs);
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> Download(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            return File(doc.FileData, "application/octet-stream", doc.FileName);
        }
    }

}