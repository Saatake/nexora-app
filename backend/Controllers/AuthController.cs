using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Nexora.Api.Models; 
using Nexora.Api.Dtos; // puxando os dtos da pasta separada
using Nexora.Api.Services; 

namespace Nexora.Api.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public AuthController(
        UserManager<ApplicationUser> userManager, 
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        IEmailService emailService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _emailService = emailService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) 
            return Unauthorized("usuário ou senha inválidos.");

        // false evita bloqueio de conta por tentativas erradas
        var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
        if (!result.Succeeded) 
            return Unauthorized("usuário ou senha inválidos.");

        // checa se o email ja foi confirmado antes de deixar logar
        if (!await _userManager.IsEmailConfirmedAsync(user))
            return Unauthorized("por favor, confirme seu e-mail antes de fazer login.");

        var token = GenerateJwtToken(user);
        return Ok(new { Token = token });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            Name = model.Name,
            Course = model.Course,
            Bio = model.Bio,
            RoleType = model.RoleType
        };

        // cria o usuario e ja faz o hash da senha
        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        // gera o token de confirmacao nativo e cria o link
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        
        // link apontando pro front-end (vite roda na 5173 por padrao)
        var link = $"http://localhost:5173/confirmar-email?email={user.Email}&token={encodedToken}";

        // dispara o email com o link
        var htmlMessage = $"<h3>bem-vindo ao ágora, {user.Name}!</h3><p>clique <a href='{link}'>aqui</a> para confirmar sua conta e começar a postar seus trabalhos.</p>";
        await _emailService.SendEmailAsync(user.Email, "confirme sua conta no ágora", htmlMessage);

        return Ok(new { Message = "usuário criado! verifique seu e-mail para confirmar a conta." });
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string email, [FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token))
            return BadRequest("dados inválidos para confirmação.");

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return NotFound("usuário não encontrado.");

        // valida o token e aprova o email no banco
        var result = await _userManager.ConfirmEmailAsync(user, token);
        
        if (!result.Succeeded)
            return BadRequest("falha ao confirmar o e-mail. o token pode estar expirado.");

        return Ok("e-mail confirmado com sucesso! você já pode fazer login.");
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        
        // por seguranca, nao revelamos se o e-mail existe ou nao
        if (user == null)
            return Ok(new { Message = "se o e-mail estiver cadastrado, você receberá um link de recuperação." });

        // gera o token de reset
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);

        // link para a pagina de reset no seu front-end react/vite
        var link = $"http://localhost:5173/resetar-senha?email={user.Email}&token={encodedToken}";

        var htmlMessage = $@"
            <h3>recuperação de senha - ágora</h3>
            <p>olá, {user.Name}. recebemos um pedido de troca de senha para sua conta.</p>
            <p>clique <a href='{link}'>aqui</a> para definir uma nova senha.</p>
            <p>se você não solicitou isso, ignore este e-mail.</p>";

        await _emailService.SendEmailAsync(user.Email, "recuperação de senha", htmlMessage);

        return Ok(new { Message = "link de recuperação enviado para o e-mail." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return BadRequest("solicitação inválida.");

        // o identity valida o token e ja atualiza a senha com hash novo
        var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { Message = "senha atualizada com sucesso! agora você já pode logar." });
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var jwtKey = _configuration["Jwt:Key"];
        var keyBytes = Encoding.UTF8.GetBytes(jwtKey!);

        // claims do jwt (dados que ficam dentro do token)
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim("Name", user.Name),
            new Claim("RoleType", user.RoleType)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(2),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}