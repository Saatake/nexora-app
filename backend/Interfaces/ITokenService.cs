using Nexora.Api.Models;

namespace Nexora.Api.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(ApplicationUser user);
}