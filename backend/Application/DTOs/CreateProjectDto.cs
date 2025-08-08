namespace Application.DTOs;

public class CreateProjectDto
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? GithubUrl { get; set; }
    public string? ImageUrl { get; set; }
}
