using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Nexora.Api.Results;

namespace Nexora.Api.Controllers;

/// <summary>
/// Controller base com helpers compartilhados para extração de userId
/// e conversão padronizada de ServiceResult → IActionResult.
/// </summary>
[ApiController]
public abstract class ApiBaseController : ControllerBase
{
    /// <summary>
    /// Retorna o ID do usuário autenticado ou null se não houver claim.
    /// </summary>
    protected string? GetCurrentUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier);

    /// <summary>
    /// Retorna o ID do usuário autenticado.
    /// Lança UnauthorizedResult se não houver claim válida.
    /// </summary>
    protected bool TryGetUserId(out string userId, out IActionResult? errorResult)
    {
        var id = GetCurrentUserId();
        if (string.IsNullOrEmpty(id))
        {
            userId = string.Empty;
            errorResult = Unauthorized();
            return false;
        }

        userId = id;
        errorResult = null;
        return true;
    }

    /// <summary>
    /// Converte um ServiceResult em IActionResult seguindo o padrão da API:
    /// IsNotFound → 404, IsForbidden → 403, IsConflict → 409, else → 400.
    /// </summary>
    protected IActionResult ToErrorResponse(ServiceResult result)
    {
        if (result.IsNotFound) return NotFound(new { message = result.Message });
        if (result.IsForbidden) return Forbid();
        if (result.IsConflict) return Conflict(new { message = result.Message });
        return BadRequest(new { message = result.Message });
    }

    /// <summary>
    /// Converte ServiceResult&lt;T&gt; em IActionResult:
    /// Succeeded → Ok(Data), else → erro padronizado.
    /// </summary>
    protected IActionResult ToResponse<T>(ServiceResult<T> result)
    {
        if (!result.Succeeded) return ToErrorResponse(result);
        return Ok(result.Data);
    }

    /// <summary>
    /// Converte ServiceResult (sem data) em IActionResult:
    /// Succeeded → Ok({ message }), else → erro padronizado.
    /// </summary>
    protected IActionResult ToResponse(ServiceResult result)
    {
        if (!result.Succeeded) return ToErrorResponse(result);
        return Ok(new { message = result.Message });
    }
}
