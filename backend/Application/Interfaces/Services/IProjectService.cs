using Application.DTOs;

namespace Application.Interfaces.Services
{
    public interface IProjectService
    {
        Task<List<ProjectDto>> GetAllAsync();
        Task<ProjectDto?> GetByIdAsync(int id);
        Task<ProjectDto> CreateAsync(CreateProjectDto dto);
        Task<bool> UpdateAsync(UpdateProjectDto dto);
        Task<bool> DeleteAsync(int id);
    }
}