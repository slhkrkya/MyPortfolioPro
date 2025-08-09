using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string fileName)
        {
            if (file == null || file.Length == 0) return BadRequest("Dosya yok.");

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);

            var ext = Path.GetExtension(file.FileName); // ".pdf" gibi
            var safeName = fileName.EndsWith(ext, StringComparison.OrdinalIgnoreCase) ? fileName : fileName + ext;

            var document = new Document
            {
                FileName = safeName,
                FileData = ms.ToArray(),
                UploadedAt = DateTime.UtcNow,
                ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? GetMimeFromExtension(ext) : file.ContentType,
                Size = file.Length
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return Ok(new { document.Id, document.FileName, document.UploadedAt, document.ContentType, document.Size });
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetAll()
        {
            var docs = _context.Documents
                .OrderByDescending(d => d.UploadedAt)
                .Select(d => new
                {
                    d.Id,
                    d.FileName,
                    d.UploadedAt,
                    d.ContentType,
                    d.Size
                })
                .ToList();

            return Ok(docs);
        }
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var d = await _context.Documents.FindAsync(id);
            if (d == null) return NotFound();

            // DTO yok; anonim obje dönüyoruz
            return Ok(new
            {
                id = d.Id,
                fileName = d.FileName,
                contentType = d.ContentType,
                size = d.Size,
                uploadedAt = d.UploadedAt
            });
        }

        [HttpGet("download/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Download(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            // Dosya adı boşsa ID’den ve varsa uzantıdan üret
            var fileName = string.IsNullOrWhiteSpace(doc.FileName) ? $"document-{id}" : doc.FileName;

            // İçerik türü boşsa uzantıdan tahmin et
            var contentType = !string.IsNullOrWhiteSpace(doc.ContentType)
                ? doc.ContentType
                : GetMimeFromExtension(Path.GetExtension(fileName));

            return File(doc.FileData, contentType, fileName);
        }

        // Basit MIME eşlemesi (gerektikçe çeşit ekleyebilirsin)
        private static string GetMimeFromExtension(string? ext)
        {
            ext = (ext ?? "").ToLowerInvariant();
            return ext switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".webp" => "image/webp",
                _ => "application/octet-stream"
            };
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            _context.Documents.Remove(doc);
            await _context.SaveChangesAsync();

            return NoContent(); // 204
        }
    }
}
