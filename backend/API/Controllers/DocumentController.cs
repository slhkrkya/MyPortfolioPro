using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        // İsteğe göre artır: 50 MB
        private const long DefaultUploadLimitBytes = 50L * 1024 * 1024;

        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            // Office
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",                                                  // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",         // .xlsx
            "text/csv",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",

            // Images
            "image/png","image/jpeg","image/webp","image/gif","image/bmp","image/svg+xml"
        };

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [RequestFormLimits(MultipartBodyLengthLimit = DefaultUploadLimitBytes)]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string fileName)
        {
            if (file is null || file.Length == 0) return BadRequest("Dosya yok.");

            // Güvenli dosya adı ve uzantı
            var incomingExt = Path.GetExtension(file.FileName);
            var safeBase = Path.GetFileName(fileName ?? string.Empty);
            if (string.IsNullOrWhiteSpace(safeBase))
                safeBase = Path.GetFileNameWithoutExtension(file.FileName);

            // Eğer kullanıcı verdiği isimde uzantı yoksa, yüklenen dosyanın uzantısını ekle
            var targetExt = Path.GetExtension(safeBase);
            if (string.IsNullOrEmpty(targetExt) && !string.IsNullOrEmpty(incomingExt))
                safeBase += incomingExt;

            var safeName = Path.GetFileName(safeBase);
            var finalExt = Path.GetExtension(safeName);

            // İçerik türünü normalize et
            string contentType = string.IsNullOrWhiteSpace(file.ContentType)
                ? "application/octet-stream"
                : file.ContentType;

            // Birçok istemci Excel için octet-stream gönderebilir; uzantıyla düzelt
            if (contentType.Equals("application/octet-stream", StringComparison.OrdinalIgnoreCase))
                contentType = GetMimeFromExtension(finalExt);

            // Eğer hâlâ beyaz listede değilse ama uzantı tanınıyorsa, uzantıya göre kabul et
            var extMime = GetMimeFromExtension(finalExt);
            var looksKnownByExt = !string.Equals(extMime, "application/octet-stream", StringComparison.OrdinalIgnoreCase);

            if (!AllowedContentTypes.Contains(contentType))
            {
                if (looksKnownByExt)
                {
                    contentType = extMime; // uzantıdan atama
                }
                else
                {
                    return BadRequest("Bu dosya formatı desteklenmiyor.");
                }
            }

            // Byte[]'e kopyala
            byte[] data;
            await using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                data = ms.ToArray();
            }

            var document = new Document
            {
                FileName = safeName,
                FileData = data,
                UploadedAt = DateTime.UtcNow,
                ContentType = contentType,
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

            var fileName = string.IsNullOrWhiteSpace(doc.FileName) ? $"document-{id}" : doc.FileName;
            var contentType = !string.IsNullOrWhiteSpace(doc.ContentType)
                ? doc.ContentType!
                : GetMimeFromExtension(Path.GetExtension(fileName));

            return File(doc.FileData, contentType, fileName);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            _context.Documents.Remove(doc);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Basit MIME eşlemesi
        private static string GetMimeFromExtension(string? ext)
        {
            ext = (ext ?? "").ToLowerInvariant();
            return ext switch
            {
                ".pdf"  => "application/pdf",
                ".doc"  => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls"  => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".csv"  => "text/csv",
                ".ppt"  => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".png"  => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".webp" => "image/webp",
                ".gif"  => "image/gif",
                ".bmp"  => "image/bmp",
                ".svg"  => "image/svg+xml",
                _       => "application/octet-stream"
            };
        }
    }
}