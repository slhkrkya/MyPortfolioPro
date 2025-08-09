using Infrastructure.Services;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Infrastructure;
using Application.Interfaces.Services;
using Application.Common.Mappings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ===== JWT ayarları =====
var jwt = builder.Configuration.GetSection("Jwt");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt["Key"]!))
        };
    });

builder.Services.AddAuthorization();

// ===== Genel servisler =====
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IGitHubImportService, GitHubImportService>();

// Katman servisleri
builder.Services.AddInfrastructure();
// GitHup dan içeri aktarma
builder.Services.AddHttpClient("github", c =>
{
    c.BaseAddress = new Uri("https://api.github.com/");
    c.DefaultRequestHeaders.UserAgent.ParseAdd("MyPortfolioPro/1.0"); // GitHub zorunlu
    c.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");
});
// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularClient", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// PostgreSQL bağlantısı (ApplicationDbContext)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// DI
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddAutoMapper(typeof(MappingProfile));
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var app = builder.Build();

// ===== Middleware sırası ÖNEMLİ =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngularClient");

app.UseAuthentication();     // Auth önce
app.UseAuthorization();      // Sonra Authorization

app.MapControllers();

app.Run();