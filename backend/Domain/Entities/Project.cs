namespace Domain.Entities;

public class Project
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? GithubUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

}