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
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Mentorship> Mentorships { get; set; }
    public DbSet<MentorshipGoal> MentorshipGoals { get; set; }
    public DbSet<MentorshipTask> MentorshipTasks { get; set; }
    public DbSet<MentorshipMessage> MentorshipMessages { get; set; }

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

        builder.Entity<Mentorship>()
            .HasOne(m => m.Project)
            .WithMany(p => p.Mentorships)
            .HasForeignKey(m => m.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Mentorship>()
            .HasOne(m => m.Professor)
            .WithMany()
            .HasForeignKey(m => m.ProfessorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<MentorshipGoal>()
            .HasOne(g => g.Mentorship)
            .WithMany(m => m.Goals)
            .HasForeignKey(g => g.MentorshipId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<MentorshipTask>()
            .HasOne(t => t.MentorshipGoal)
            .WithMany(g => g.Tasks)
            .HasForeignKey(t => t.MentorshipGoalId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<MentorshipMessage>()
            .HasOne(mm => mm.Mentorship)
            .WithMany(m => m.Messages)
            .HasForeignKey(mm => mm.MentorshipId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<MentorshipMessage>()
            .HasOne(mm => mm.Sender)
            .WithMany()
            .HasForeignKey(mm => mm.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Notification>()
            .HasOne(n => n.Sender)
            .WithMany()
            .HasForeignKey(n => n.SenderId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
