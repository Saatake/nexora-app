using Nexora.Api.Dtos.Responses;

namespace Nexora.Api.Results;

// Herda de ServiceResult<T> — sem repetir Succeeded, Message, IsNotFound, IsForbidden, IsConflict
public class MentorshipResult : ServiceResult<MentorshipResponseDto> { }

public class MentorshipGoalResult : ServiceResult<MentorshipGoalResponseDto> { }
