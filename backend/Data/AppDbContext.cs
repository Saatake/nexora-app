using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Nexora.Api.Models;

namespace Nexora.Api.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Evaluation> Evaluations { get; set; }
    public DbSet<ProjectCollaborator> ProjectCollaborators { get; set; }
    public DbSet<UserTeachingArea> UserTeachingAreas { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ProjectCollaborator>()
            .HasKey(pc => new { pc.ProjectId, pc.UserId });

        builder.Entity<ProjectCollaborator>()
            .HasOne(pc => pc.Project)
            .WithMany(p => p.Collaborators)
            .HasForeignKey(pc => pc.ProjectId);

        builder.Entity<ProjectCollaborator>()
            .HasOne(pc => pc.User)
            .WithMany()
            .HasForeignKey(pc => pc.UserId);

        builder.Entity<Evaluation>()
            .HasIndex(e => new { e.ProjectId, e.ProfessorId })
            .IsUnique();

        builder.Entity<UserTeachingArea>()
            .HasKey(ta => new { ta.UserId, ta.Area });

        builder.Entity<UserTeachingArea>()
            .HasOne(ta => ta.User)
            .WithMany(u => u.TeachingAreas)
            .HasForeignKey(ta => ta.UserId);
    }
}
