namespace Nexora.Api.Dtos.Requests;

public class UpdateProfileRequestDto
{
    public string Name { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
}

public class ChangePasswordRequestDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}