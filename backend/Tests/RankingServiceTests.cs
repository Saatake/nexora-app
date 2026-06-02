using Microsoft.EntityFrameworkCore;
using Xunit;
using Nexora.Api.Services;
using Nexora.Api.Models;
using Nexora.Api.Data;
using Nexora.Api.Enums;

public class RankingServiceTests
{
    [Fact]
    public async Task GetTopStudentsAsync_ShouldReturnProfilePictureUrl_WhenUserHasItSet()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        using (var context = new AppDbContext(options)) 
        {
            context.Users.Add(new ApplicationUser
            {
                Id = "user1",
                Name = "Alice",
                Course = "Computer Science",
                RoleType = UserRole.Estudante,
                ProfilePictureUrl = "http://example.com/photo.jpg"
            });

            context.Projects.Add(new Project
            {
                Id = 1,
                Title = "Project 1",
                Description = "Null",
                UserId = "user1",
                Evaluations = new List<Evaluation>
                {
                    new Evaluation
                    {
                        Id = 1,
                        Relevance = 8,
                        Quality = 9,
                        Methodology = 7,
                        Presentation = 8,
                        Innovation = 9
                    }
                }
                
            });

            await context.SaveChangesAsync();
        }

        using (var context = new AppDbContext(options))
        {
            var service = new RankingService(context);
            var result = await service.GetTopStudentsAsync();

            Assert.NotNull(result);
            Assert.NotEmpty(result);

            var student = result.FirstOrDefault(s => s.StudentId == "user1");
            Assert.NotNull(student);

            Assert.Equal("http://example.com/photo.jpg", student.ProfilePictureUrl);
        }
    }
}

