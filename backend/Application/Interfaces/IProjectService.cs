using Application.DTOs;

namespace Application.Interfaces;

public interface IProjectService
{
    List<ProjectDto> GetAll();
    ProjectDto GetById(int id);
    void Create(ProjectDto project);
    void Delete(int id);
}
