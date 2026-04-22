namespace Nexora.Api.Dtos.Responses;

public class ProjectResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string GithubLink { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Texto da categoria
    public string AuthorName { get; set; } = string.Empty; // Nome do aluno que postou
    public DateTime CreatedAt { get; set; }
}