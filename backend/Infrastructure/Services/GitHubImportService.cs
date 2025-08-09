using Application.Interfaces.Services;
using Application.DTOs; 
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Net.Http;

public class GitHubImportService : IGitHubImportService
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly ApplicationDbContext _db;

    public GitHubImportService(IHttpClientFactory httpFactory, ApplicationDbContext db)
    {
        _httpFactory = httpFactory;
        _db = db;
    }

    public async Task<int> ImportUserReposAsync(string username, int take = 6)
    {
        var http = _httpFactory.CreateClient("github");
        var url = $"users/{username}/repos?sort=updated&per_page={take}";
        var resp = await http.GetAsync(url);
        resp.EnsureSuccessStatusCode();

        using var stream = await resp.Content.ReadAsStreamAsync();
        var repos = await JsonSerializer.DeserializeAsync<List<GhRepo>>(stream, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? new();

        var createdCount = 0;
        foreach (var r in repos.Where(x => !x.Fork)) // fork’ları alma
        {
            var githubUrl = r.Html_Url;
            var exists = await _db.Projects.AnyAsync(p => p.GithubUrl == githubUrl);
            if (exists) continue;

            var dto = new CreateProjectDto
            {
                Title = r.Name,
                Description = string.IsNullOrWhiteSpace(r.Description) ? "GitHub projesi" : r.Description!,
                GithubUrl = githubUrl,
                ImageUrl = null
            };

            // Entity oluşturup kaydet (ProjectService kullanıyorsan onu da çağırabilirsin)
            _db.Projects.Add(new Domain.Entities.Project
            {
                Title = dto.Title,
                Description = dto.Description,
                GithubUrl = dto.GithubUrl,
                ImageUrl = null,
                CreatedAt = DateTime.UtcNow
            });
            createdCount++;
        }

        if (createdCount > 0) await _db.SaveChangesAsync();
        return createdCount;
    }

    private class GhRepo
    {
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public bool Fork { get; set; }
        public string Html_Url { get; set; } = "";
    }
}