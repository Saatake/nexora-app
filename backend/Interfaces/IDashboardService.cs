using Nexora.Api.Dtos.Responses;

namespace Nexora.Api.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(string userId);
    Task<DashboardChartsDto> GetChartsAsync(string userId);
}
