using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Project> Projects { get; set; }
    public DbSet<Document> Documents { get; set; }
    // Diğer DbSet'leri buraya ekle
}