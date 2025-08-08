namespace Application.DTOs;

public class UpdateProjectDto
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? GithubUrl { get; set; }
    public string? ImageUrl { get; set; }
}
