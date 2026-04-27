using Nexora.Api.Dtos.Responses;

namespace Nexora.Api.Interfaces;

public interface IRankingService
{
    Task<IEnumerable<RankingProjectDto>> GetTopProjectsAsync(int count = 10);
    Task<IEnumerable<RankingStudentDto>> GetTopStudentsAsync(int count = 5);
    Task<GeneralStatsDto> GetGeneralStatsAsync();
}
