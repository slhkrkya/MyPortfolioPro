using Application.Interfaces.Services;
using Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            // Servisleri buraya ekle
            services.AddScoped<IProjectService, ProjectService>();

            // Diğer servisleri buraya ekleyebilirsin
            return services;
        }
    }
}