namespace Domain.Entities
{
    public class Document
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public byte[] FileData { get; set; } = Array.Empty<byte>();
        public DateTime UploadedAt { get; set; }
        public string? ContentType { get; set; }
        public long? Size { get; set; }
    }
}
