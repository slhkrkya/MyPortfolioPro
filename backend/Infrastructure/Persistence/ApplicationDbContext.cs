using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<Document> Documents { get; set; } = null!;
    public DbSet<SiteProfile> SiteProfiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tek kayıtlı seed data
        modelBuilder.Entity<SiteProfile>().HasData(
            new SiteProfile
            {
                Id = 1,
                FullName = "Ad Soyad",
                Tagline = "Kısa açıklama",
                About = new[] { "Hakkımda 1", "Hakkımda 2" },
                Github = "https://github.com/kullaniciadi",
                LinkedIn = "https://linkedin.com/in/kullaniciadi",
                Instagram = "https://instagram.com/kullaniciadi",
                Email = "mail@ornek.com"
            }
        );
    }
}
