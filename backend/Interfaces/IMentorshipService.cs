using Nexora.Api.Dtos.Requests;
using Nexora.Api.Dtos.Responses;
using Nexora.Api.Results;

namespace Nexora.Api.Interfaces;

public interface IMentorshipService
{
    Task<MentorshipResult> RequestMentorshipAsync(int projectId, RequestMentorshipRequestDto request, string userId);
    Task<MentorshipResult> AcceptMentorshipAsync(int mentorshipId, string userId);
    Task<MentorshipResult> RejectMentorshipAsync(int mentorshipId, string userId);
    Task<MentorshipResult> RevokeMentorshipAsync(int mentorshipId, string userId, string? reason = null);
    Task<MentorshipResult> CompleteMentorshipAsync(int mentorshipId, string userId);
    Task<MentorshipResult> GetProjectMentorshipAsync(int projectId, string? userId);
    Task<MentorshipResult> GetMentorshipByIdAsync(int mentorshipId, string userId);
    Task<List<MentorshipResponseDto>> GetProfessorActiveMentorshipsAsync(string professorId);
    Task<List<MentorshipResponseDto>> GetProfessorPendingRequestsAsync(string professorId);

    // Metas (Goals / Marcos)
    Task<MentorshipGoalResult> CreateGoalAsync(int mentorshipId, CreateMentorshipGoalRequestDto request, string userId);
    Task<MentorshipGoalResult> UpdateGoalAsync(int goalId, UpdateMentorshipGoalRequestDto request, string userId);
    Task<MentorshipGoalResult> SubmitGoalAsync(int goalId, SubmitMentorshipGoalRequestDto request, string userId);
    Task<MentorshipGoalResult> ReviewGoalAsync(int goalId, ReviewMentorshipGoalRequestDto request, string userId);
    Task<bool> DeleteGoalAsync(int goalId, string userId);

    // Tarefas dentro de metas (Tasks)
    Task<MentorshipTaskResult> CreateTaskAsync(int goalId, CreateMentorshipTaskRequestDto request, string userId);
    Task<MentorshipTaskResult> ToggleTaskAsync(int taskId, string userId);
    Task<MentorshipTaskResult> UpdateTaskAsync(int taskId, UpdateMentorshipTaskRequestDto request, string userId);
    Task<bool> DeleteTaskAsync(int taskId, string userId);

    // Mensagens do Chat
    Task<List<MentorshipMessageResponseDto>> GetMessagesAsync(int mentorshipId, string userId, int page = 1, int pageSize = 50);
    Task<MentorshipMessageResponseDto?> SendMessageAsync(int mentorshipId, SendMentorshipMessageRequestDto request, string userId);
}
