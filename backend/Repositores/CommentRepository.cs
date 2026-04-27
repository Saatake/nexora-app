using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;

namespace Nexora.Api.Repositories;

public class CommentRepository : ICommentRepository
{
    private readonly AppDbContext _context;

    public CommentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Comment> CreateAsync(Comment comment)
    {
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        // recarrega com User para ter o nome do autor
        await _context.Entry(comment).Reference(c => c.User).LoadAsync();
        return comment;
    }

    public async Task<IEnumerable<Comment>> GetByProjectIdAsync(int projectId)
    {
        return await _context.Comments
            .Include(c => c.User)
            .Where(c => c.ProjectId == projectId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }
}
