using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;

namespace Nexora.Api.Interfaces;

public interface ICommentService
{
    Task<CommentResponseDto> CreateAsync(int projectId, CreateCommentRequestDto model, string userId);
    Task<IEnumerable<CommentResponseDto>> GetByProjectIdAsync(int projectId);
}
