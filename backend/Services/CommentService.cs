using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;

namespace Nexora.Api.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;

    public CommentService(ICommentRepository commentRepository)
    {
        _commentRepository = commentRepository;
    }

    public async Task<CommentResponseDto> CreateAsync(int projectId, CreateCommentRequestDto model, string userId)
    {
        var comment = new Comment
        {
            Text = model.Text,
            ProjectId = projectId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _commentRepository.CreateAsync(comment);

        return MapToDto(created);
    }

    public async Task<IEnumerable<CommentResponseDto>> GetByProjectIdAsync(int projectId)
    {
        var comments = await _commentRepository.GetByProjectIdAsync(projectId);
        return comments.Select(MapToDto);
    }

    private static CommentResponseDto MapToDto(Comment c)
    {
        return new CommentResponseDto
        {
            Id = c.Id,
            Text = c.Text,
            AuthorName = c.User?.Name ?? "Anônimo",
            AuthorId = c.UserId,
            CreatedAt = c.CreatedAt
        };
    }
}
