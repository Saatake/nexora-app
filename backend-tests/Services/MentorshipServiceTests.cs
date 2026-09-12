using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;
using Nexora.Api.Data;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Services;
using Nexora.Api.Tests.Helpers;

namespace Nexora.Api.Tests.Services;

public class MentorshipServiceTests
{
    private (MentorshipService service, AppDbContext context, Mock<INotificationService> notifMock) CreateService()
    {
        var context = TestDbContextFactory.Create();
        var userManager = TestDbContextFactory.CreateMockUserManager(context);
        var notifMock = new Mock<INotificationService>();

        notifMock.Setup(n => n.CreateNotificationAsync(
                It.IsAny<string>(), It.IsAny<NotificationType>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<string?>()))
            .ReturnsAsync(new Notification());

        var service = new MentorshipService(context, userManager.Object, notifMock.Object);
        return (service, context, notifMock);
    }

    private async Task SeedBaseData(AppDbContext context) => await TestDbContextFactory.SeedBaseDataAsync(context);

    // ==================== RequestMentorshipAsync ====================

    [Fact]
    public async Task RequestMentorship_ProfessorRole_ShouldCreatePendingAndNotifyStudent()
    {
        var (service, context, notifMock) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            var result = await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto
            {
                Message = "Gostaria de orientar este projeto."
            }, "prof1");

            Assert.True(result.Succeeded);
            Assert.NotNull(result.Data);
            Assert.Equal(MentorshipStatus.PendingApproval, result.Data!.Status);
            Assert.Equal(MentorshipInitiator.Professor, result.Data.InitiatedBy);
            Assert.Equal("prof1", result.Data.ProfessorId);

            // Verifica notificação enviada ao dono do projeto
            notifMock.Verify(n => n.CreateNotificationAsync(
                "student1", NotificationType.MentorshipRequest,
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>(), "prof1"), Times.Once);
        }
    }

    [Fact]
    public async Task RequestMentorship_StudentRole_ShouldCreatePendingAndNotifyProfessor()
    {
        var (service, context, notifMock) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            var result = await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto
            {
                ProfessorId = "prof1",
                Message = "Convido você para orientar meu projeto."
            }, "student1");

            Assert.True(result.Succeeded);
            Assert.NotNull(result.Data);
            Assert.Equal(MentorshipInitiator.Student, result.Data!.InitiatedBy);

            notifMock.Verify(n => n.CreateNotificationAsync(
                "prof1", NotificationType.MentorshipRequest,
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>(), "student1"), Times.Once);
        }
    }

    [Fact]
    public async Task RequestMentorship_DuplicateActive_ShouldReturnConflict()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            // Cria mentoria ativa diretamente
            context.Mentorships.Add(new Mentorship
            {
                ProjectId = 1,
                ProfessorId = "prof1",
                Status = MentorshipStatus.Active,
                InitiatedBy = MentorshipInitiator.Professor,
                RequestedAt = DateTime.UtcNow,
                AcceptedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();

            var result = await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto
            {
                Message = "Outra solicitação"
            }, "prof2");

            Assert.False(result.Succeeded);
            Assert.True(result.IsConflict);
        }
    }

    [Fact]
    public async Task RequestMentorship_DuplicatePending_ShouldReturnConflict()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            // Primeira solicitação
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Primeira" }, "prof1");

            // Segunda solicitação — deve conflitar
            var result = await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Segunda" }, "prof2");

            Assert.False(result.Succeeded);
            Assert.True(result.IsConflict);
        }
    }

    [Fact]
    public async Task RequestMentorship_StudentWithoutProfessorId_ShouldFail()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            var result = await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto
            {
                ProfessorId = null,
                Message = "Sem professor"
            }, "student1");

            Assert.False(result.Succeeded);
            Assert.Contains("obrigatório", result.Message);
        }
    }

    [Fact]
    public async Task RequestMentorship_ProjectNotFound_ShouldReturnNotFound()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            var result = await service.RequestMentorshipAsync(999, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");

            Assert.False(result.Succeeded);
            Assert.True(result.IsNotFound);
        }
    }

    [Fact]
    public async Task RequestMentorship_NonMemberStudent_ShouldReturnForbidden()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            // Adiciona outro estudante que NÃO é dono nem colaborador
            context.Users.Add(TestDbContextFactory.CreateStudent("student2", "Maria"));
            await context.SaveChangesAsync();

            var result = await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto
            {
                ProfessorId = "prof1"
            }, "student2");

            Assert.False(result.Succeeded);
            Assert.True(result.IsForbidden);
        }
    }

    // ==================== AcceptMentorshipAsync ====================

    [Fact]
    public async Task AcceptMentorship_ShouldSetActiveAndNotify()
    {
        var (service, context, notifMock) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Quero orientar" }, "prof1");

            var mentorship = await context.Mentorships.FirstAsync();

            // Dono do projeto aceita (pois foi o professor que iniciou)
            var result = await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            Assert.True(result.Succeeded);
            Assert.NotNull(result.Data);
            Assert.Equal(MentorshipStatus.Active, result.Data!.Status);

            // Deve ter atualizado o Advisor no projeto
            var project = await context.Projects.FindAsync(1);
            Assert.Equal("Prof. Ana", project!.Advisor);

            // Verifica notificação de aceite
            notifMock.Verify(n => n.CreateNotificationAsync(
                "prof1", NotificationType.MentorshipAccepted,
                It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>(), "student1"), Times.Once);
        }
    }

    [Fact]
    public async Task AcceptMentorship_WrongUser_ShouldReturnForbidden()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Quero orientar" }, "prof1");

            var mentorship = await context.Mentorships.FirstAsync();

            // Prof2 tenta aceitar algo que foi para student1
            var result = await service.AcceptMentorshipAsync(mentorship.Id, "prof2");

            Assert.False(result.Succeeded);
            Assert.True(result.IsForbidden);
        }
    }

    [Fact]
    public async Task AcceptMentorship_AlreadyAccepted_ShouldFail()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");

            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            // Tenta aceitar de novo
            var result = await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            Assert.False(result.Succeeded);
            Assert.Contains("pendente", result.Message);
        }
    }

    // ==================== RejectMentorshipAsync ====================

    [Fact]
    public async Task RejectMentorship_ShouldSetRejected()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Quero orientar" }, "prof1");

            var mentorship = await context.Mentorships.FirstAsync();

            var result = await service.RejectMentorshipAsync(mentorship.Id, "student1");

            Assert.True(result.Succeeded);

            var updated = await context.Mentorships.FindAsync(mentorship.Id);
            Assert.Equal(MentorshipStatus.Rejected, updated!.Status);
            Assert.NotNull(updated.EndedAt);
        }
    }

    [Fact]
    public async Task RejectMentorship_WrongUser_ShouldReturnForbidden()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");

            var mentorship = await context.Mentorships.FirstAsync();

            // Prof2 tenta recusar algo que foi para student1
            var result = await service.RejectMentorshipAsync(mentorship.Id, "prof2");

            Assert.False(result.Succeeded);
            Assert.True(result.IsForbidden);
        }
    }

    // ==================== RevokeMentorshipAsync ====================

    [Fact]
    public async Task RevokeMentorship_ShouldSetRevokedAndClearAdvisor()
    {
        var (service, context, notifMock) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            // Verifica que o Advisor foi setado
            var project = await context.Projects.FindAsync(1);
            Assert.NotNull(project!.Advisor);

            // Professor revoga
            var result = await service.RevokeMentorshipAsync(mentorship.Id, "prof1");

            Assert.True(result.Succeeded);

            var updated = await context.Mentorships.FindAsync(mentorship.Id);
            Assert.Equal(MentorshipStatus.Revoked, updated!.Status);
            Assert.NotNull(updated.EndedAt);

            // Advisor deve ter sido limpo
            project = await context.Projects.FindAsync(1);
            Assert.Null(project!.Advisor);
        }
    }

    [Fact]
    public async Task RevokeMentorship_Unauthorized_ShouldReturnForbidden()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            context.Users.Add(TestDbContextFactory.CreateStudent("student2", "Maria"));
            await context.SaveChangesAsync();

            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            // student2 tenta revogar sem ser membro
            var result = await service.RevokeMentorshipAsync(mentorship.Id, "student2");

            Assert.False(result.Succeeded);
            Assert.True(result.IsForbidden);
        }
    }

    [Fact]
    public async Task RevokeMentorship_OnInactive_ShouldFail()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();

            // Tenta revogar sem estar ativa (está PendingApproval)
            var result = await service.RevokeMentorshipAsync(mentorship.Id, "prof1");

            Assert.False(result.Succeeded);
            Assert.Contains("ativas", result.Message);
        }
    }

    // ==================== GetProjectMentorshipAsync ====================

    [Fact]
    public async Task GetProjectMentorship_ShouldReturnActiveOrPending()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");

            var result = await service.GetProjectMentorshipAsync(1, "student1");

            Assert.True(result.Succeeded);
            Assert.NotNull(result.Data);
            Assert.Equal(MentorshipStatus.PendingApproval, result.Data!.Status);
        }
    }

    [Fact]
    public async Task GetProjectMentorship_ShouldReturnNull_WhenNoMentorship()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            var result = await service.GetProjectMentorshipAsync(1, "student1");

            Assert.True(result.Succeeded);
            Assert.Null(result.Data);
        }
    }

    // ==================== GetMentorshipByIdAsync ====================

    [Fact]
    public async Task GetMentorshipById_Unauthorized_ShouldReturnForbidden()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            context.Users.Add(TestDbContextFactory.CreateStudent("student2", "Maria"));
            await context.SaveChangesAsync();

            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();

            // student2 não é membro — deve ser proibido
            var result = await service.GetMentorshipByIdAsync(mentorship.Id, "student2");

            Assert.False(result.Succeeded);
            Assert.True(result.IsForbidden);
        }
    }

    // ==================== Goals ====================

    [Fact]
    public async Task CreateGoal_ProfessorOnly_ShouldCreate()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            var result = await service.CreateGoalAsync(mentorship.Id, new CreateMentorshipGoalRequestDto
            {
                Title = "Entregar artigo",
                Description = "Descrição da meta",
                DueDate = DateTime.UtcNow.AddDays(30)
            }, "prof1");

            Assert.True(result.Succeeded);
            Assert.NotNull(result.Data);
            Assert.Equal("Entregar artigo", result.Data!.Title);
            Assert.Equal(MentorshipGoalStatus.Pending, result.Data.Status);
        }
    }

    [Fact]
    public async Task CreateGoal_StudentCannotCreate_ShouldReturnForbidden()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            var result = await service.CreateGoalAsync(mentorship.Id, new CreateMentorshipGoalRequestDto
            {
                Title = "Tentativa do aluno"
            }, "student1");

            Assert.False(result.Succeeded);
            Assert.True(result.IsForbidden);
        }
    }

    [Fact]
    public async Task SubmitGoal_StudentOrCollab_ShouldSetSubmitted()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            var goalResult = await service.CreateGoalAsync(mentorship.Id, new CreateMentorshipGoalRequestDto
            {
                Title = "Meta teste"
            }, "prof1");

            var submitResult = await service.SubmitGoalAsync(goalResult.Data!.Id, new SubmitMentorshipGoalRequestDto
            {
                Note = "Concluído conforme orientação."
            }, "student1");

            Assert.True(submitResult.Succeeded);
            Assert.Equal(MentorshipGoalStatus.Submitted, submitResult.Data!.Status);
        }
    }

    [Fact]
    public async Task ReviewGoal_Approve_ShouldSetApproved()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            var goalResult = await service.CreateGoalAsync(mentorship.Id, new CreateMentorshipGoalRequestDto { Title = "Meta" }, "prof1");
            await service.SubmitGoalAsync(goalResult.Data!.Id, new SubmitMentorshipGoalRequestDto(), "student1");

            var reviewResult = await service.ReviewGoalAsync(goalResult.Data.Id, new ReviewMentorshipGoalRequestDto
            {
                Approved = true,
                Feedback = "Excelente trabalho!"
            }, "prof1");

            Assert.True(reviewResult.Succeeded);
            Assert.Equal(MentorshipGoalStatus.Approved, reviewResult.Data!.Status);
            Assert.Equal("Excelente trabalho!", reviewResult.Data.ProfessorFeedback);
        }
    }

    [Fact]
    public async Task ReviewGoal_NeedsRevision_ShouldSetNeedsRevision()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            var goalResult = await service.CreateGoalAsync(mentorship.Id, new CreateMentorshipGoalRequestDto { Title = "Meta" }, "prof1");
            await service.SubmitGoalAsync(goalResult.Data!.Id, new SubmitMentorshipGoalRequestDto(), "student1");

            var reviewResult = await service.ReviewGoalAsync(goalResult.Data.Id, new ReviewMentorshipGoalRequestDto
            {
                Approved = false,
                Feedback = "Ajustar formatação ABNT."
            }, "prof1");

            Assert.True(reviewResult.Succeeded);
            Assert.Equal(MentorshipGoalStatus.NeedsRevision, reviewResult.Data!.Status);
        }
    }

    [Fact]
    public async Task DeleteGoal_ProfessorOnly_ShouldRemove()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            var goalResult = await service.CreateGoalAsync(mentorship.Id, new CreateMentorshipGoalRequestDto { Title = "Meta" }, "prof1");

            var deleted = await service.DeleteGoalAsync(goalResult.Data!.Id, "prof1");

            Assert.True(deleted);
            Assert.Equal(0, await context.MentorshipGoals.CountAsync());
        }
    }

    [Fact]
    public async Task DeleteGoal_StudentCannotDelete_ShouldReturnFalse()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            var goalResult = await service.CreateGoalAsync(mentorship.Id, new CreateMentorshipGoalRequestDto { Title = "Meta" }, "prof1");

            var deleted = await service.DeleteGoalAsync(goalResult.Data!.Id, "student1");

            Assert.False(deleted);
            Assert.Equal(1, await context.MentorshipGoals.CountAsync());
        }
    }

    // ==================== Chat ====================

    [Fact]
    public async Task SendMessage_AuthorizedUser_ShouldPersist()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            var msg = await service.SendMessageAsync(mentorship.Id, new SendMentorshipMessageRequestDto
            {
                Content = "Olá professor, posso tirar uma dúvida?"
            }, "student1");

            Assert.NotNull(msg);
            Assert.Equal("Olá professor, posso tirar uma dúvida?", msg!.Content);
            Assert.Equal("student1", msg.SenderId);
            Assert.Equal(1, await context.MentorshipMessages.CountAsync());
        }
    }

    [Fact]
    public async Task SendMessage_UnauthorizedUser_ShouldReturnNull()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            context.Users.Add(TestDbContextFactory.CreateStudent("student2", "Maria"));
            await context.SaveChangesAsync();

            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            var msg = await service.SendMessageAsync(mentorship.Id, new SendMentorshipMessageRequestDto
            {
                Content = "Não deveria ser permitido."
            }, "student2");

            Assert.Null(msg);
            Assert.Equal(0, await context.MentorshipMessages.CountAsync());
        }
    }

    [Fact]
    public async Task GetMessages_ShouldReturnPaginated()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);
            await service.RequestMentorshipAsync(1, new RequestMentorshipRequestDto { Message = "Test" }, "prof1");
            var mentorship = await context.Mentorships.FirstAsync();
            await service.AcceptMentorshipAsync(mentorship.Id, "student1");

            // Envia 5 mensagens
            for (int i = 0; i < 5; i++)
            {
                await service.SendMessageAsync(mentorship.Id, new SendMentorshipMessageRequestDto
                {
                    Content = $"Mensagem {i}"
                }, i % 2 == 0 ? "student1" : "prof1");
            }

            var messages = await service.GetMessagesAsync(mentorship.Id, "student1", page: 1, pageSize: 3);

            Assert.Equal(3, messages.Count);
        }
    }

    // ==================== Professor Lists ====================

    [Fact]
    public async Task GetProfessorActiveMentorships_ShouldReturnOnlyActive()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            // Cria um segundo projeto
            context.Projects.Add(new Project
            {
                Id = 2,
                Title = "Projeto Beta",
                Description = "Desc",
                UserId = "student1",
                ThematicArea = ThematicArea.TecnologiaInovacao,
                Category = ProjectCategory.IniciacaoCientifica
            });
            await context.SaveChangesAsync();

            // Mentoria ativa no projeto 1
            context.Mentorships.Add(new Mentorship
            {
                ProjectId = 1, ProfessorId = "prof1",
                Status = MentorshipStatus.Active,
                InitiatedBy = MentorshipInitiator.Professor,
                RequestedAt = DateTime.UtcNow, AcceptedAt = DateTime.UtcNow
            });

            // Mentoria pendente no projeto 2 (não deve aparecer)
            context.Mentorships.Add(new Mentorship
            {
                ProjectId = 2, ProfessorId = "prof1",
                Status = MentorshipStatus.PendingApproval,
                InitiatedBy = MentorshipInitiator.Student,
                RequestedAt = DateTime.UtcNow
            });
            await context.SaveChangesAsync();

            var result = await service.GetProfessorActiveMentorshipsAsync("prof1");

            Assert.Single(result);
            Assert.Equal("Projeto Alpha", result[0].ProjectTitle);
        }
    }

    // ==================== CompleteMentorshipAsync ====================

    [Fact]
    public async Task CompleteMentorship_ByProfessor_ShouldSetStatusCompleted()
    {
        var (service, context, notifMock) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            var mentorship = new Mentorship
            {
                Id = 1,
                ProjectId = 1,
                ProfessorId = "prof1",
                Status = MentorshipStatus.Active,
                InitiatedBy = MentorshipInitiator.Professor,
                AcceptedAt = DateTime.UtcNow
            };
            context.Mentorships.Add(mentorship);
            await context.SaveChangesAsync();

            var result = await service.CompleteMentorshipAsync(1, "prof1");

            Assert.True(result.Succeeded);
            Assert.NotNull(result.Data);
            Assert.Equal(MentorshipStatus.Completed, result.Data!.Status);

            var updated = await context.Mentorships.FindAsync(1);
            Assert.Equal(MentorshipStatus.Completed, updated!.Status);
            Assert.NotNull(updated.EndedAt);
        }
    }

    // ==================== UpdateGoalAsync ====================

    [Fact]
    public async Task UpdateGoal_ByProfessor_ShouldUpdateFields()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            var mentorship = new Mentorship
            {
                Id = 1, ProjectId = 1, ProfessorId = "prof1",
                Status = MentorshipStatus.Active,
                InitiatedBy = MentorshipInitiator.Professor
            };
            context.Mentorships.Add(mentorship);

            var goal = new MentorshipGoal
            {
                Id = 1, MentorshipId = 1, Title = "Antigo", Description = "Desc Antiga"
            };
            context.MentorshipGoals.Add(goal);
            await context.SaveChangesAsync();

            var result = await service.UpdateGoalAsync(1, new UpdateMentorshipGoalRequestDto
            {
                Title = "Novo Título",
                Description = "Nova Descrição"
            }, "prof1");

            Assert.True(result.Succeeded);
            Assert.Equal("Novo Título", result.Data!.Title);
            Assert.Equal("Nova Descrição", result.Data.Description);
        }
    }

    // ==================== Task Operations ====================

    [Fact]
    public async Task TaskOperations_CreateToggleDelete_ShouldWorkCorrectly()
    {
        var (service, context, _) = CreateService();
        using (context)
        {
            await SeedBaseData(context);

            var mentorship = new Mentorship
            {
                Id = 1, ProjectId = 1, ProfessorId = "prof1",
                Status = MentorshipStatus.Active,
                InitiatedBy = MentorshipInitiator.Professor
            };
            context.Mentorships.Add(mentorship);

            var goal = new MentorshipGoal
            {
                Id = 1, MentorshipId = 1, Title = "Marco 1"
            };
            context.MentorshipGoals.Add(goal);
            await context.SaveChangesAsync();

            // 1. Create task
            var createRes = await service.CreateTaskAsync(1, new CreateMentorshipTaskRequestDto
            {
                Title = "Tarefa 1",
                Description = "Detalhes da tarefa"
            }, "prof1");

            Assert.True(createRes.Succeeded);
            var taskId = createRes.Data!.Id;
            Assert.False(createRes.Data.IsCompleted);

            // 2. Toggle task (concluir)
            var toggleRes = await service.ToggleTaskAsync(taskId, "student1");
            Assert.True(toggleRes.Succeeded);
            Assert.True(toggleRes.Data!.IsCompleted);

            // 3. Delete task
            var deleteSuccess = await service.DeleteTaskAsync(taskId, "prof1");
            Assert.True(deleteSuccess);
            Assert.Empty(context.MentorshipTasks.Where(t => t.Id == taskId));
        }
    }
}
