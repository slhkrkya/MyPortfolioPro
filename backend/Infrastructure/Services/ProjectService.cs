using Application.DTOs;
using Application.Interfaces;

namespace Infrastructure.Services;

public class ProjectService : IProjectService
{
    private static List<ProjectDto> _projects = new()
    {
        new ProjectDto { Id = 1, Title = "Kariyer Portfolyo", Description = "Kişisel web sitesi", GithubUrl = "https://github.com/salih/portfolio" },
        new ProjectDto { Id = 2, Title = "Otomat Projesi", Description = "Stok ve ürün takibi", GithubUrl = "https://github.com/salih/otomat" }
    };

    public List<ProjectDto> GetAll()
    {
        return _projects;
    }

    public ProjectDto GetById(int id)
    {
        return _projects.FirstOrDefault(p => p.Id == id)!;
    }

    public void Create(ProjectDto project)
    {
        project.Id = _projects.Max(p => p.Id) + 1;
        _projects.Add(project);
    }

    public void Delete(int id)
    {
        var project = _projects.FirstOrDefault(p => p.Id == id);
        if (project is not null)
            _projects.Remove(project);
    }
}
