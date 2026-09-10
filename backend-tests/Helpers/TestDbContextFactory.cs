using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using Nexora.Api.Data;
using Nexora.Api.Enums;
using Nexora.Api.Models;

namespace Nexora.Api.Tests.Helpers;

/// <summary>
/// Fábrica de DbContext in-memory e dados de seed reutilizáveis para testes.
/// </summary>
public static class TestDbContextFactory
{
    public static AppDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName ?? $"TestDb_{Guid.NewGuid()}")
            .Options;
        return new AppDbContext(options);
    }

    /// <summary>
    /// Seed padrão: 2 professores, 1 estudante e 1 projeto do estudante.
    /// </summary>
    public static async Task SeedBaseDataAsync(AppDbContext context)
    {
        context.Users.AddRange(
            CreateProfessor("prof1", "Prof. Ana"),
            CreateProfessor("prof2", "Prof. Carlos"),
            CreateStudent("student1", "Aluno João")
        );

        context.Projects.Add(new Project
        {
            Id = 1,
            Title = "Projeto Alpha",
            Description = "Descrição do projeto de teste",
            UserId = "student1",
            ThematicArea = ThematicArea.TecnologiaInovacao,
            Category = ProjectCategory.IniciacaoCientifica
        });

        await context.SaveChangesAsync();
    }

    public static ApplicationUser CreateProfessor(string id, string name, string? photoUrl = null)
    {
        return new ApplicationUser
        {
            Id = id,
            Name = name,
            UserName = $"{id}@test.com",
            Email = $"{id}@test.com",
            RoleType = UserRole.Professor,
            PhotoUrl = photoUrl,
            Course = "Ciência da Computação"
        };
    }

    public static ApplicationUser CreateStudent(string id, string name, string? photoUrl = null)
    {
        return new ApplicationUser
        {
            Id = id,
            Name = name,
            UserName = $"{id}@test.com",
            Email = $"{id}@test.com",
            RoleType = UserRole.Estudante,
            PhotoUrl = photoUrl,
            Course = "Engenharia de Software"
        };
    }

    /// <summary>
    /// Cria um mock de UserManager que retorna usuários do contexto.
    /// </summary>
    public static Mock<UserManager<ApplicationUser>> CreateMockUserManager(AppDbContext context)
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        var mgr = new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        mgr.Setup(x => x.FindByIdAsync(It.IsAny<string>()))
            .Returns<string>(id => context.Users.FirstOrDefaultAsync(u => u.Id == id)!);

        return mgr;
    }
}
