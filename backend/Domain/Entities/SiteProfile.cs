using System.ComponentModel.DataAnnotations;

namespace Domain.Entities
{
    public class SiteProfile
    {
        [Key] public int Id { get; set; } = 1;               // tek kayıt
        [MaxLength(120)] public string FullName { get; set; } = string.Empty;
        [MaxLength(240)] public string Tagline  { get; set; } = string.Empty;

        // PostgreSQL: text[]
        public string[] About { get; set; } = Array.Empty<string>();

        [MaxLength(200)] public string Github    { get; set; } = string.Empty;
        [MaxLength(200)] public string LinkedIn  { get; set; } = string.Empty;
        [MaxLength(200)] public string Instagram { get; set; } = string.Empty;
        [MaxLength(200)] public string Email     { get; set; } = string.Empty;
    }
}