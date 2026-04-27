using Nexora.Api.Models;

namespace Nexora.Api.Interfaces;

public interface ICommentRepository
{
    Task<Comment> CreateAsync(Comment comment);
    Task<IEnumerable<Comment>> GetByProjectIdAsync(int projectId);
}
