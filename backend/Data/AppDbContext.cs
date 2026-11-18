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
    public DbSet<ProjectBadge> ProjectBadges { get; set; }
    public DbSet<ProjectContentBlock> ProjectContentBlocks { get; set; }
    public DbSet<Portfolio> Portfolios { get; set; }
    public DbSet<PortfolioProject> PortfolioProjects { get; set; }

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

        builder.Entity<ProjectBadge>()
            .HasIndex(b => new { b.ProjectId, b.Badge, b.ProfessorId })
            .IsUnique();

        builder.Entity<ProjectBadge>()
            .HasOne(b => b.Project)
            .WithMany(p => p.Badges)
            .HasForeignKey(b => b.ProjectId);

        builder.Entity<ProjectBadge>()
            .HasOne(b => b.Professor)
            .WithMany()
            .HasForeignKey(b => b.ProfessorId);

        builder.Entity<ProjectContentBlock>()
            .HasOne(block => block.Project)
            .WithMany(project => project.ContentBlocks)
            .HasForeignKey(block => block.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Portfolio>()
            .HasIndex(p => p.UserId)
            .IsUnique();
        builder.Entity<Portfolio>()
            .HasIndex(p => p.Slug)
            .IsUnique();
        builder.Entity<Portfolio>()
            .Property(p => p.DesignSpecJson)
            .HasColumnType("jsonb");
        builder.Entity<PortfolioProject>()
            .HasKey(p => new { p.PortfolioId, p.ProjectId });
        builder.Entity<PortfolioProject>()
            .HasOne(p => p.Portfolio)
            .WithMany(p => p.Projects)
            .HasForeignKey(p => p.PortfolioId);
        builder.Entity<PortfolioProject>()
            .HasOne(p => p.Project)
            .WithMany()
            .HasForeignKey(p => p.ProjectId);
    }
}
