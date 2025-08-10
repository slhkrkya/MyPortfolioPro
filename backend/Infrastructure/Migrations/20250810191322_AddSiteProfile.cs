using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSiteProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SiteProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Tagline = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: false),
                    About = table.Column<string[]>(type: "text[]", nullable: false),
                    Github = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    LinkedIn = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Instagram = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteProfiles", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "SiteProfiles",
                columns: new[] { "Id", "About", "Email", "FullName", "Github", "Instagram", "LinkedIn", "Tagline" },
                values: new object[] { 1, new[] { "Hakkımda 1", "Hakkımda 2" }, "mail@ornek.com", "Ad Soyad", "https://github.com/kullaniciadi", "https://instagram.com/kullaniciadi", "https://linkedin.com/in/kullaniciadi", "Kısa açıklama" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SiteProfiles");
        }
    }
}
