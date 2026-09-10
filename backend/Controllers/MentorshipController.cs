using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Dtos.Requests;
using Nexora.Api.Interfaces;

namespace Nexora.Api.Controllers;

[Authorize]
public class MentorshipController : ApiBaseController
{
    private readonly IMentorshipService _mentorshipService;

    public MentorshipController(IMentorshipService mentorshipService)
    {
        _mentorshipService = mentorshipService;
    }

    [HttpPost("api/projects/{projectId}/mentorship/request")]
    public async Task<IActionResult> RequestMentorship(int projectId, [FromBody] RequestMentorshipRequestDto request)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        return ToResponse(await _mentorshipService.RequestMentorshipAsync(projectId, request, userId));
    }

    [HttpGet("api/projects/{projectId}/mentorship")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProjectMentorship(int projectId)
    {
        var userId = GetCurrentUserId();
        var result = await _mentorshipService.GetProjectMentorshipAsync(projectId, userId);
        return Ok(result.Data);
    }

    [HttpPost("api/mentorships/{id}/accept")]
    public async Task<IActionResult> AcceptMentorship(int id)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        return ToResponse(await _mentorshipService.AcceptMentorshipAsync(id, userId));
    }

    [HttpPost("api/mentorships/{id}/reject")]
    public async Task<IActionResult> RejectMentorship(int id)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        var result = await _mentorshipService.RejectMentorshipAsync(id, userId);
        return ToResponse(result);
    }

    [HttpPost("api/mentorships/{id}/revoke")]
    public async Task<IActionResult> RevokeMentorship(int id, [FromBody] string? reason = null)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        var result = await _mentorshipService.RevokeMentorshipAsync(id, userId, reason);
        return ToResponse(result);
    }

    [HttpGet("api/mentorships/{id}")]
    public async Task<IActionResult> GetMentorshipById(int id)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        return ToResponse(await _mentorshipService.GetMentorshipByIdAsync(id, userId));
    }

    [HttpGet("api/mentorships/professor/active")]
    public async Task<IActionResult> GetProfessorActiveMentorships()
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        return Ok(await _mentorshipService.GetProfessorActiveMentorshipsAsync(userId));
    }

    [HttpGet("api/mentorships/professor/requests")]
    public async Task<IActionResult> GetProfessorPendingRequests()
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        return Ok(await _mentorshipService.GetProfessorPendingRequestsAsync(userId));
    }

    // ================= Metas (Goals) =================

    [HttpPost("api/mentorships/{id}/goals")]
    public async Task<IActionResult> CreateGoal(int id, [FromBody] CreateMentorshipGoalRequestDto request)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        return ToResponse(await _mentorshipService.CreateGoalAsync(id, request, userId));
    }

    [HttpPost("api/mentorships/goals/{goalId}/submit")]
    public async Task<IActionResult> SubmitGoal(int goalId, [FromBody] SubmitMentorshipGoalRequestDto request)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        return ToResponse(await _mentorshipService.SubmitGoalAsync(goalId, request, userId));
    }

    [HttpPost("api/mentorships/goals/{goalId}/review")]
    public async Task<IActionResult> ReviewGoal(int goalId, [FromBody] ReviewMentorshipGoalRequestDto request)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        return ToResponse(await _mentorshipService.ReviewGoalAsync(goalId, request, userId));
    }

    [HttpDelete("api/mentorships/goals/{goalId}")]
    public async Task<IActionResult> DeleteGoal(int goalId)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        var success = await _mentorshipService.DeleteGoalAsync(goalId, userId);
        if (!success) return BadRequest(new { message = "Não foi possível excluir a meta." });
        return Ok(new { message = "Meta excluída com sucesso." });
    }

    // ================= Chat Privado =================

    [HttpGet("api/mentorships/{id}/messages")]
    public async Task<IActionResult> GetMessages(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        return Ok(await _mentorshipService.GetMessagesAsync(id, userId, page, pageSize));
    }

    [HttpPost("api/mentorships/{id}/messages")]
    public async Task<IActionResult> SendMessage(int id, [FromBody] SendMentorshipMessageRequestDto request)
    {
        if (!TryGetUserId(out var userId, out var error)) return error!;
        var message = await _mentorshipService.SendMessageAsync(id, request, userId);
        if (message == null) return BadRequest(new { message = "Não foi possível enviar a mensagem." });
        return Ok(message);
    }
}
