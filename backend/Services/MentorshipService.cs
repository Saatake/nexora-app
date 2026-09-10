using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Enums;
using Nexora.Api.Interfaces;
using Nexora.Api.Models;
using Nexora.Api.Results;

namespace Nexora.Api.Services;

public class MentorshipService : IMentorshipService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly INotificationService _notificationService;

    public MentorshipService(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        INotificationService notificationService)
    {
        _context = context;
        _userManager = userManager;
        _notificationService = notificationService;
    }

    // ===================== Solicitação de Mentoria =====================

    public async Task<MentorshipResult> RequestMentorshipAsync(int projectId, RequestMentorshipRequestDto request, string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return MentorshipResult.Fail("Usuário não encontrado.") as MentorshipResult ?? new();

        var project = await _context.Projects
            .Include(p => p.User)
            .Include(p => p.Collaborators)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            return new MentorshipResult { Succeeded = false, IsNotFound = true, Message = "Projeto não encontrado." };

        // Verifica se já tem mentoria ativa ou pendente
        var existingConflict = await CheckExistingMentorshipAsync(projectId);
        if (existingConflict != null) return existingConflict;

        Mentorship mentorship;

        if (user.RoleType == UserRole.Professor)
        {
            mentorship = CreateMentorshipEntity(projectId, userId, MentorshipInitiator.Professor, request.Message);

            _context.Mentorships.Add(mentorship);
            await _context.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(
                userId: project.UserId,
                type: NotificationType.MentorshipRequest,
                title: "Solicitação de mentoria recebida",
                message: $"O Prof. {user.Name} solicitou orientar o seu projeto '{project.Title}'.",
                link: $"/projects/{projectId}",
                senderId: userId);
        }
        else
        {
            if (!IsProjectMember(project, userId))
                return new MentorshipResult { Succeeded = false, IsForbidden = true, Message = "Apenas o autor ou colaboradores podem convidar um professor." };

            if (string.IsNullOrEmpty(request.ProfessorId))
                return new MentorshipResult { Succeeded = false, Message = "O ID do professor orientador é obrigatório." };

            var professor = await _userManager.FindByIdAsync(request.ProfessorId);
            if (professor == null || professor.RoleType != UserRole.Professor)
                return new MentorshipResult { Succeeded = false, Message = "Professor orientador não encontrado ou usuário não é docente." };

            mentorship = CreateMentorshipEntity(projectId, request.ProfessorId, MentorshipInitiator.Student, request.Message);

            _context.Mentorships.Add(mentorship);
            await _context.SaveChangesAsync();

            await _notificationService.CreateNotificationAsync(
                userId: request.ProfessorId,
                type: NotificationType.MentorshipRequest,
                title: "Novo convite de mentoria",
                message: $"{user.Name} convidou você para orientar o projeto '{project.Title}'.",
                link: $"/projects/{projectId}",
                senderId: userId);
        }

        var dto = await MapToDto(mentorship.Id);
        return new MentorshipResult { Succeeded = true, Data = dto, Message = "Solicitação enviada com sucesso." };
    }

    // ===================== Aceitar =====================

    public async Task<MentorshipResult> AcceptMentorshipAsync(int mentorshipId, string userId)
    {
        var mentorship = await LoadMentorshipWithProjectAsync(mentorshipId);

        if (mentorship == null)
            return new MentorshipResult { Succeeded = false, IsNotFound = true, Message = "Mentoria não encontrada." };

        if (mentorship.Status != MentorshipStatus.PendingApproval)
            return new MentorshipResult { Succeeded = false, Message = "Esta solicitação não está mais pendente." };

        // Valida permissão
        if (mentorship.InitiatedBy == MentorshipInitiator.Student && mentorship.ProfessorId != userId)
            return new MentorshipResult { Succeeded = false, IsForbidden = true, Message = "Apenas o professor convidado pode aceitar." };

        if (mentorship.InitiatedBy == MentorshipInitiator.Professor && mentorship.Project?.UserId != userId)
            return new MentorshipResult { Succeeded = false, IsForbidden = true, Message = "Apenas o autor do projeto pode aceitar a orientação." };

        // Valida se o projeto já tem outra mentoria ativa
        var hasActive = await _context.Mentorships
            .AnyAsync(m => m.ProjectId == mentorship.ProjectId && m.Status == MentorshipStatus.Active && m.Id != mentorshipId);
        if (hasActive)
            return new MentorshipResult { Succeeded = false, IsConflict = true, Message = "Este projeto já possui outro orientador ativo." };

        mentorship.Status = MentorshipStatus.Active;
        mentorship.AcceptedAt = DateTime.UtcNow;

        if (mentorship.Project != null && mentorship.Professor != null)
            mentorship.Project.Advisor = mentorship.Professor.Name;

        await _context.SaveChangesAsync();

        // Notifica o iniciador
        var projectTitle = mentorship.Project?.Title ?? "Projeto";
        var professorName = mentorship.Professor?.Name ?? "Professor";

        if (mentorship.InitiatedBy == MentorshipInitiator.Student && mentorship.Project != null)
        {
            await _notificationService.CreateNotificationAsync(
                userId: mentorship.Project.UserId,
                type: NotificationType.MentorshipAccepted,
                title: "Convite de mentoria aceito!",
                message: $"O Prof. {professorName} aceitou orientar o seu projeto '{projectTitle}'.",
                link: $"/projects/{mentorship.ProjectId}",
                senderId: mentorship.ProfessorId);
        }
        else
        {
            await _notificationService.CreateNotificationAsync(
                userId: mentorship.ProfessorId,
                type: NotificationType.MentorshipAccepted,
                title: "Solicitação de mentoria aprovada!",
                message: $"O autor do projeto '{projectTitle}' aceitou sua orientação.",
                link: $"/projects/{mentorship.ProjectId}",
                senderId: userId);
        }

        var dto = await MapToDto(mentorship.Id);
        return new MentorshipResult { Succeeded = true, Data = dto, Message = "Mentoria iniciada com sucesso!" };
    }

    // ===================== Rejeitar =====================

    public async Task<MentorshipResult> RejectMentorshipAsync(int mentorshipId, string userId)
    {
        var mentorship = await LoadMentorshipWithProjectAsync(mentorshipId);

        if (mentorship == null)
            return new MentorshipResult { Succeeded = false, IsNotFound = true, Message = "Mentoria não encontrada." };

        if (mentorship.Status != MentorshipStatus.PendingApproval)
            return new MentorshipResult { Succeeded = false, Message = "Esta solicitação não está pendente." };

        if (mentorship.InitiatedBy == MentorshipInitiator.Student && mentorship.ProfessorId != userId)
            return new MentorshipResult { Succeeded = false, IsForbidden = true, Message = "Sem permissão para recusar." };

        if (mentorship.InitiatedBy == MentorshipInitiator.Professor && mentorship.Project?.UserId != userId)
            return new MentorshipResult { Succeeded = false, IsForbidden = true, Message = "Sem permissão para recusar." };

        mentorship.Status = MentorshipStatus.Rejected;
        mentorship.EndedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var projectTitle = mentorship.Project?.Title ?? "Projeto";
        if (mentorship.InitiatedBy == MentorshipInitiator.Student && mentorship.Project != null)
        {
            await _notificationService.CreateNotificationAsync(
                userId: mentorship.Project.UserId,
                type: NotificationType.MentorshipRejected,
                title: "Convite de mentoria recusado",
                message: $"O Prof. {mentorship.Professor?.Name} não pôde aceitar a orientação do projeto '{projectTitle}'.",
                link: $"/projects/{mentorship.ProjectId}",
                senderId: userId);
        }
        else
        {
            await _notificationService.CreateNotificationAsync(
                userId: mentorship.ProfessorId,
                type: NotificationType.MentorshipRejected,
                title: "Solicitação de mentoria não aceita",
                message: $"A solicitação de orientação para o projeto '{projectTitle}' não foi aceita.",
                link: $"/projects/{mentorship.ProjectId}",
                senderId: userId);
        }

        return new MentorshipResult { Succeeded = true, Message = "Solicitação recusada." };
    }

    // ===================== Revogar =====================

    public async Task<MentorshipResult> RevokeMentorshipAsync(int mentorshipId, string userId, string? reason = null)
    {
        var mentorship = await LoadMentorshipWithProjectAsync(mentorshipId);

        if (mentorship == null)
            return new MentorshipResult { Succeeded = false, IsNotFound = true, Message = "Mentoria não encontrada." };

        if (mentorship.Status != MentorshipStatus.Active)
            return new MentorshipResult { Succeeded = false, Message = "Apenas mentorias ativas podem ser revogadas." };

        var isProfessor = mentorship.ProfessorId == userId;
        if (!isProfessor && !IsProjectMember(mentorship.Project!, userId))
            return new MentorshipResult { Succeeded = false, IsForbidden = true, Message = "Sem permissão para encerrar esta mentoria." };

        mentorship.Status = MentorshipStatus.Revoked;
        mentorship.EndedAt = DateTime.UtcNow;

        if (mentorship.Project != null)
            mentorship.Project.Advisor = null;

        await _context.SaveChangesAsync();

        var projectTitle = mentorship.Project?.Title ?? "Projeto";
        if (isProfessor && mentorship.Project != null)
        {
            await _notificationService.CreateNotificationAsync(
                userId: mentorship.Project.UserId,
                type: NotificationType.MentorshipRevoked,
                title: "Orientação de projeto encerrada",
                message: $"O Prof. {mentorship.Professor?.Name} encerrou a orientação do projeto '{projectTitle}'.",
                link: $"/projects/{mentorship.ProjectId}",
                senderId: userId);
        }
        else
        {
            await _notificationService.CreateNotificationAsync(
                userId: mentorship.ProfessorId,
                type: NotificationType.MentorshipRevoked,
                title: "Orientação de projeto encerrada",
                message: $"A orientação do projeto '{projectTitle}' foi finalizada pela equipe.",
                link: $"/projects/{mentorship.ProjectId}",
                senderId: userId);
        }

        return new MentorshipResult { Succeeded = true, Message = "Mentoria encerrada com sucesso." };
    }

    // ===================== Consultas =====================

    public async Task<MentorshipResult> GetProjectMentorshipAsync(int projectId, string? userId)
    {
        var mentorship = await _context.Mentorships
            .Where(m => m.ProjectId == projectId && (m.Status == MentorshipStatus.Active || m.Status == MentorshipStatus.PendingApproval))
            .OrderByDescending(m => m.Status == MentorshipStatus.Active)
            .ThenByDescending(m => m.RequestedAt)
            .FirstOrDefaultAsync();

        if (mentorship == null)
            return new MentorshipResult { Succeeded = true, Data = null, Message = "Nenhuma mentoria ativa ou pendente." };

        var dto = await MapToDto(mentorship.Id);
        return new MentorshipResult { Succeeded = true, Data = dto };
    }

    public async Task<MentorshipResult> GetMentorshipByIdAsync(int mentorshipId, string userId)
    {
        var mentorship = await _context.Mentorships
            .Include(m => m.Project)
            .ThenInclude(p => p!.Collaborators)
            .FirstOrDefaultAsync(m => m.Id == mentorshipId);

        if (mentorship == null)
            return new MentorshipResult { Succeeded = false, IsNotFound = true, Message = "Mentoria não encontrada." };

        // Autorização: só o professor mentor, o autor ou colaboradores podem ver
        var isProfessor = mentorship.ProfessorId == userId;
        var isMember = mentorship.Project != null && IsProjectMember(mentorship.Project, userId);
        if (!isProfessor && !isMember)
            return new MentorshipResult { Succeeded = false, IsForbidden = true, Message = "Sem permissão para visualizar esta mentoria." };

        var dto = await MapToDto(mentorshipId);
        return new MentorshipResult { Succeeded = true, Data = dto };
    }

    public async Task<List<MentorshipResponseDto>> GetProfessorActiveMentorshipsAsync(string professorId)
    {
        return await BuildMentorshipListQuery(
            m => m.ProfessorId == professorId && m.Status == MentorshipStatus.Active,
            m => m.AcceptedAt ?? m.RequestedAt
        ).ToListAsync();
    }

    public async Task<List<MentorshipResponseDto>> GetProfessorPendingRequestsAsync(string professorId)
    {
        return await BuildMentorshipListQuery(
            m => m.ProfessorId == professorId && m.Status == MentorshipStatus.PendingApproval && m.InitiatedBy == MentorshipInitiator.Student,
            m => m.RequestedAt
        ).ToListAsync();
    }

    // ===================== Metas (Goals) =====================

    public async Task<MentorshipGoalResult> CreateGoalAsync(int mentorshipId, CreateMentorshipGoalRequestDto request, string userId)
    {
        var mentorship = await _context.Mentorships
            .Include(m => m.Project)
            .FirstOrDefaultAsync(m => m.Id == mentorshipId && m.Status == MentorshipStatus.Active);

        if (mentorship == null)
            return new MentorshipGoalResult { Succeeded = false, IsNotFound = true, Message = "Mentoria ativa não encontrada." };

        if (mentorship.ProfessorId != userId)
            return new MentorshipGoalResult { Succeeded = false, IsForbidden = true, Message = "Apenas o orientador pode criar metas." };

        var goal = new MentorshipGoal
        {
            MentorshipId = mentorshipId,
            Title = request.Title,
            Description = request.Description,
            DueDate = request.DueDate,
            Status = MentorshipGoalStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.MentorshipGoals.Add(goal);
        await _context.SaveChangesAsync();

        if (mentorship.Project != null)
        {
            await _notificationService.CreateNotificationAsync(
                userId: mentorship.Project.UserId,
                type: NotificationType.GoalCreated,
                title: "Nova meta definida pelo orientador",
                message: $"O professor adicionou a meta '{goal.Title}' para seu projeto.",
                link: $"/projects/{mentorship.ProjectId}",
                senderId: userId);
        }

        return new MentorshipGoalResult { Succeeded = true, Message = "Meta criada com sucesso.", Data = MapGoalToDto(goal) };
    }

    public async Task<MentorshipGoalResult> SubmitGoalAsync(int goalId, SubmitMentorshipGoalRequestDto request, string userId)
    {
        var goal = await LoadGoalWithMentorshipAsync(goalId);

        if (goal?.Mentorship == null || goal.Mentorship.Status != MentorshipStatus.Active)
            return new MentorshipGoalResult { Succeeded = false, IsNotFound = true, Message = "Meta não encontrada ou mentoria inativa." };

        if (goal.Mentorship.Project == null || !IsProjectMember(goal.Mentorship.Project, userId))
            return new MentorshipGoalResult { Succeeded = false, IsForbidden = true, Message = "Apenas membros do projeto podem marcar a meta como concluída." };

        goal.Status = MentorshipGoalStatus.Submitted;
        goal.CompletedAt = DateTime.UtcNow;
        goal.StudentSubmissionNote = request.Note;
        await _context.SaveChangesAsync();

        var projectTitle = goal.Mentorship.Project.Title;
        await _notificationService.CreateNotificationAsync(
            userId: goal.Mentorship.ProfessorId,
            type: NotificationType.GoalSubmitted,
            title: "Meta enviada para revisão",
            message: $"A meta '{goal.Title}' do projeto '{projectTitle}' foi entregue pelos alunos e aguarda sua revisão.",
            link: $"/projects/{goal.Mentorship.ProjectId}",
            senderId: userId);

        return new MentorshipGoalResult { Succeeded = true, Data = MapGoalToDto(goal), Message = "Meta entregue com sucesso." };
    }

    public async Task<MentorshipGoalResult> ReviewGoalAsync(int goalId, ReviewMentorshipGoalRequestDto request, string userId)
    {
        var goal = await _context.MentorshipGoals
            .Include(g => g.Mentorship)
            .ThenInclude(m => m!.Project)
            .FirstOrDefaultAsync(g => g.Id == goalId);

        if (goal?.Mentorship == null || goal.Mentorship.Status != MentorshipStatus.Active)
            return new MentorshipGoalResult { Succeeded = false, IsNotFound = true, Message = "Meta não encontrada ou mentoria inativa." };

        if (goal.Mentorship.ProfessorId != userId)
            return new MentorshipGoalResult { Succeeded = false, IsForbidden = true, Message = "Apenas o orientador pode revisar a meta." };

        goal.Status = request.Approved ? MentorshipGoalStatus.Approved : MentorshipGoalStatus.NeedsRevision;
        goal.ProfessorFeedback = request.Feedback;
        goal.ReviewedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        if (goal.Mentorship.Project != null)
        {
            var statusText = request.Approved ? "aprovada com sucesso!" : "necessita de ajustes.";
            await _notificationService.CreateNotificationAsync(
                userId: goal.Mentorship.Project.UserId,
                type: NotificationType.GoalReviewed,
                title: $"Meta {(request.Approved ? "aprovada" : "devolvida com ajustes")}",
                message: $"O orientador revisou a meta '{goal.Title}': {statusText}",
                link: $"/projects/{goal.Mentorship.ProjectId}",
                senderId: userId);
        }

        return new MentorshipGoalResult { Succeeded = true, Data = MapGoalToDto(goal), Message = "Revisão salva com sucesso." };
    }

    public async Task<bool> DeleteGoalAsync(int goalId, string userId)
    {
        var goal = await _context.MentorshipGoals
            .Include(g => g.Mentorship)
            .FirstOrDefaultAsync(g => g.Id == goalId);

        if (goal?.Mentorship == null) return false;
        if (goal.Mentorship.ProfessorId != userId) return false;

        _context.MentorshipGoals.Remove(goal);
        await _context.SaveChangesAsync();
        return true;
    }

    // ===================== Chat Privado =====================

    public async Task<List<MentorshipMessageResponseDto>> GetMessagesAsync(int mentorshipId, string userId, int page = 1, int pageSize = 50)
    {
        var mentorship = await _context.Mentorships
            .Include(m => m.Project)
            .ThenInclude(p => p!.Collaborators)
            .FirstOrDefaultAsync(m => m.Id == mentorshipId);

        if (mentorship == null) return [];

        var isProfessor = mentorship.ProfessorId == userId;
        if (!isProfessor && (mentorship.Project == null || !IsProjectMember(mentorship.Project, userId)))
            return [];

        return await _context.MentorshipMessages
            .Where(m => m.MentorshipId == mentorshipId)
            .Include(m => m.Sender)
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MentorshipMessageResponseDto
            {
                Id = m.Id,
                MentorshipId = m.MentorshipId,
                SenderId = m.SenderId,
                SenderName = m.Sender != null ? m.Sender.Name : "Usuário",
                SenderPhotoUrl = m.Sender != null ? m.Sender.PhotoUrl : null,
                SenderRole = m.Sender != null ? m.Sender.RoleType.ToString() : "",
                Content = m.Content,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<MentorshipMessageResponseDto?> SendMessageAsync(int mentorshipId, SendMentorshipMessageRequestDto request, string userId)
    {
        var mentorship = await _context.Mentorships
            .Include(m => m.Project)
            .ThenInclude(p => p!.Collaborators)
            .FirstOrDefaultAsync(m => m.Id == mentorshipId && m.Status == MentorshipStatus.Active);

        if (mentorship == null) return null;

        var isProfessor = mentorship.ProfessorId == userId;
        if (!isProfessor && (mentorship.Project == null || !IsProjectMember(mentorship.Project, userId)))
            return null;

        var message = new MentorshipMessage
        {
            MentorshipId = mentorshipId,
            SenderId = userId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        _context.MentorshipMessages.Add(message);
        await _context.SaveChangesAsync();

        var sender = await _userManager.FindByIdAsync(userId);

        return new MentorshipMessageResponseDto
        {
            Id = message.Id,
            MentorshipId = message.MentorshipId,
            SenderId = userId,
            SenderName = sender?.Name ?? "Usuário",
            SenderPhotoUrl = sender?.PhotoUrl,
            SenderRole = sender?.RoleType.ToString() ?? "",
            Content = message.Content,
            CreatedAt = message.CreatedAt
        };
    }

    // ===================== Helpers Privados =====================

    /// <summary>
    /// Verifica se já existe mentoria ativa ou pendente para o projeto.
    /// Retorna MentorshipResult de conflito ou null se ok.
    /// </summary>
    private async Task<MentorshipResult?> CheckExistingMentorshipAsync(int projectId)
    {
        var hasActive = await _context.Mentorships
            .AnyAsync(m => m.ProjectId == projectId && m.Status == MentorshipStatus.Active);
        if (hasActive)
            return new MentorshipResult { Succeeded = false, IsConflict = true, Message = "Este projeto já possui um professor orientador ativo." };

        var hasPending = await _context.Mentorships
            .AnyAsync(m => m.ProjectId == projectId && m.Status == MentorshipStatus.PendingApproval);
        if (hasPending)
            return new MentorshipResult { Succeeded = false, IsConflict = true, Message = "Já existe uma solicitação de mentoria pendente para este projeto." };

        return null;
    }

    /// <summary>
    /// Verifica se o usuário é autor ou colaborador do projeto.
    /// </summary>
    private static bool IsProjectMember(Project project, string userId)
    {
        return project.UserId == userId || project.Collaborators.Any(c => c.UserId == userId);
    }

    /// <summary>
    /// Cria a entidade Mentorship com os campos padrão.
    /// </summary>
    private static Mentorship CreateMentorshipEntity(int projectId, string professorId, MentorshipInitiator initiator, string? message)
    {
        return new Mentorship
        {
            ProjectId = projectId,
            ProfessorId = professorId,
            InitiatedBy = initiator,
            Status = MentorshipStatus.PendingApproval,
            RequestMessage = message,
            RequestedAt = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Carrega mentorship com Project (+ Collaborators) e Professor inclusos.
    /// </summary>
    private async Task<Mentorship?> LoadMentorshipWithProjectAsync(int mentorshipId)
    {
        return await _context.Mentorships
            .Include(m => m.Project)
            .ThenInclude(p => p!.Collaborators)
            .Include(m => m.Professor)
            .FirstOrDefaultAsync(m => m.Id == mentorshipId);
    }

    /// <summary>
    /// Carrega MentorshipGoal com Mentorship → Project → Collaborators inclusos.
    /// </summary>
    private async Task<MentorshipGoal?> LoadGoalWithMentorshipAsync(int goalId)
    {
        return await _context.MentorshipGoals
            .Include(g => g.Mentorship)
            .ThenInclude(m => m!.Project)
            .ThenInclude(p => p!.Collaborators)
            .FirstOrDefaultAsync(g => g.Id == goalId);
    }

    /// <summary>
    /// Constrói query projetada para listas de mentorias (elimina N+1).
    /// </summary>
    private IQueryable<MentorshipResponseDto> BuildMentorshipListQuery(
        System.Linq.Expressions.Expression<Func<Mentorship, bool>> predicate,
        System.Linq.Expressions.Expression<Func<Mentorship, DateTime>> orderByDesc)
    {
        return _context.Mentorships
            .Where(predicate)
            .Include(x => x.Project).ThenInclude(p => p!.User)
            .Include(x => x.Professor)
            .Include(x => x.Goals)
            .OrderByDescending(orderByDesc)
            .Select(m => new MentorshipResponseDto
            {
                Id = m.Id,
                ProjectId = m.ProjectId,
                ProjectTitle = m.Project != null ? m.Project.Title : "",
                ProfessorId = m.ProfessorId,
                ProfessorName = m.Professor != null ? m.Professor.Name : "",
                ProfessorPhotoUrl = m.Professor != null ? m.Professor.PhotoUrl : null,
                ProfessorCourse = m.Professor != null ? m.Professor.Course : null,
                StudentAuthorId = m.Project != null ? m.Project.UserId : "",
                StudentAuthorName = m.Project != null && m.Project.User != null ? m.Project.User.Name : "",
                Status = m.Status,
                InitiatedBy = m.InitiatedBy,
                RequestMessage = m.RequestMessage,
                RequestedAt = m.RequestedAt,
                AcceptedAt = m.AcceptedAt,
                EndedAt = m.EndedAt,
                TotalGoals = m.Goals.Count,
                PendingReviewGoals = m.Goals.Count(g => g.Status == MentorshipGoalStatus.Submitted),
                CompletedGoals = m.Goals.Count(g => g.Status == MentorshipGoalStatus.Approved),
                Goals = m.Goals.OrderBy(g => g.CreatedAt).Select(g => new MentorshipGoalResponseDto
                {
                    Id = g.Id,
                    MentorshipId = g.MentorshipId,
                    Title = g.Title,
                    Description = g.Description,
                    DueDate = g.DueDate,
                    Status = g.Status,
                    ProfessorFeedback = g.ProfessorFeedback,
                    StudentSubmissionNote = g.StudentSubmissionNote,
                    CreatedAt = g.CreatedAt,
                    CompletedAt = g.CompletedAt,
                    ReviewedAt = g.ReviewedAt
                }).ToList()
            });
    }

    private async Task<MentorshipResponseDto?> MapToDto(int mentorshipId)
    {
        var m = await _context.Mentorships
            .Include(x => x.Project).ThenInclude(p => p!.User)
            .Include(x => x.Professor)
            .Include(x => x.Goals)
            .FirstOrDefaultAsync(x => x.Id == mentorshipId);

        if (m == null) return null;

        var goals = m.Goals.OrderBy(g => g.CreatedAt).Select(MapGoalToDto).ToList();

        return new MentorshipResponseDto
        {
            Id = m.Id,
            ProjectId = m.ProjectId,
            ProjectTitle = m.Project?.Title ?? "",
            ProfessorId = m.ProfessorId,
            ProfessorName = m.Professor?.Name ?? "",
            ProfessorPhotoUrl = m.Professor?.PhotoUrl,
            ProfessorCourse = m.Professor?.Course,
            StudentAuthorId = m.Project?.UserId ?? "",
            StudentAuthorName = m.Project?.User?.Name ?? "",
            Status = m.Status,
            InitiatedBy = m.InitiatedBy,
            RequestMessage = m.RequestMessage,
            RequestedAt = m.RequestedAt,
            AcceptedAt = m.AcceptedAt,
            EndedAt = m.EndedAt,
            TotalGoals = goals.Count,
            PendingReviewGoals = goals.Count(g => g.Status == MentorshipGoalStatus.Submitted),
            CompletedGoals = goals.Count(g => g.Status == MentorshipGoalStatus.Approved),
            Goals = goals
        };
    }

    private static MentorshipGoalResponseDto MapGoalToDto(MentorshipGoal g)
    {
        return new MentorshipGoalResponseDto
        {
            Id = g.Id,
            MentorshipId = g.MentorshipId,
            Title = g.Title,
            Description = g.Description,
            DueDate = g.DueDate,
            Status = g.Status,
            ProfessorFeedback = g.ProfessorFeedback,
            StudentSubmissionNote = g.StudentSubmissionNote,
            CreatedAt = g.CreatedAt,
            CompletedAt = g.CompletedAt,
            ReviewedAt = g.ReviewedAt
        };
    }
}
