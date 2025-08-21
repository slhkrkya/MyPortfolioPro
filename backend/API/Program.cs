using Infrastructure.Services;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Infrastructure;
using Application.Interfaces.Services;
using Application.Common.Mappings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Net;
using System.Net.Mail;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides; // ← eklendi
using Microsoft.OpenApi.Models;
using API.Infrastructure.Swagger;

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
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "MyPortfolioPro API", Version = "v1" });
    
    // File upload desteği için
    c.OperationFilter<FileUploadOperationFilter>();
    
    // JWT authentication için
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddScoped<IGitHubImportService, GitHubImportService>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();

// Katman servisleri
builder.Services.AddInfrastructure();

// GitHub’dan içe aktarma
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

// ===== Forwarded Headers (proxy arkasında doğru IP) =====
builder.Services.Configure<ForwardedHeadersOptions>(opt =>
{
    opt.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Cloud ortamlarında ağları önceden bilemeyeceğimiz için listeleri boşaltıyoruz:
    opt.KnownNetworks.Clear();
    opt.KnownProxies.Clear();
});

// ===== Rate Limiting (Contact policy) =====
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests; // 429 döndür
    options.AddPolicy("contact", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                // İstersen 1/dk yapabilirsin; şimdilik mevcut 5/dk korundu
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));
});

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

// proxy başlıklarını oku → gerçek istemci IP’si
app.UseForwardedHeaders();

// HTTPS redirect sadece production'da
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAngularClient");

app.UseRateLimiter();

app.UseAuthentication();     // Auth önce
app.UseAuthorization();      // Sonra Authorization

app.MapControllers();

app.Run();