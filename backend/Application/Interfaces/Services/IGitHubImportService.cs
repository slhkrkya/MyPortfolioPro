using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IGitHubImportService
    {
        Task<int> ImportUserReposAsync(string username, int take = 6);
    }
}