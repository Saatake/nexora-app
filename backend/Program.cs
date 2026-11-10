using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Models;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json.Serialization;
using Nexora.Api.Services;
using Nexora.Api.Interfaces;
using Nexora.Api.Repositories;
using Nexora.Api.Middlewares;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.FileProviders;
using System.Threading.RateLimiting;
using Resend;

var builder = WebApplication.CreateBuilder(args);

var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:5173";

// DB
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var useInMemoryDatabase = builder.Environment.IsDevelopment()
    && builder.Configuration.GetValue<bool>("Database:UseInMemory");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (useInMemoryDatabase)
        options.UseInMemoryDatabase("AgoraLocalPortfolioTest");
    else
        options.UseNpgsql(connectionString);
});

// Identity (sem endpoints automáticos)
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// JWT
var jwtKey = builder.Configuration["Jwt:Key"];
var keyBytes = Encoding.UTF8.GetBytes(jwtKey!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var loggerFactory = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger("JwtBearer");

            // Authorization header tem prioridade (Swagger, chamadas diretas)
            var authHeader = context.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                context.Token = authHeader["Bearer ".Length..].Trim();
                return Task.CompletedTask;
            }

            // fallback: lê do cookie httpOnly
            var cookieToken = context.Request.Cookies["jwt"];
            if (!string.IsNullOrEmpty(cookieToken))
            {
                context.Token = cookieToken;
                return Task.CompletedTask;
            }

            logger.LogWarning("JWT ausente em {Path}", context.Request.Path);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var loggerFactory = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger("JwtBearer");
            var userId = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                logger.LogWarning("JWT validated but NameIdentifier claim is missing.");
            }
            else
            {
                logger.LogInformation("JWT validated for user {UserId}", userId);
            }
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            var loggerFactory = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger("JwtBearer");
            logger.LogWarning(context.Exception, "JWT auth failed for {Path}", context.HttpContext.Request.Path);
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            var loggerFactory = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>();
            var logger = loggerFactory.CreateLogger("JwtBearer");
            if (!context.Handled)
            {
                logger.LogWarning("JWT challenge: error={Error} description={Description}", context.Error, context.ErrorDescription);
            }
            return Task.CompletedTask;
        }
    };
});

// IMPORTANTÍSSIMO
builder.Services.AddAuthorization();

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddSlidingWindowLimiter("auth", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 6; // verifica a cada 10s
        opt.PermitLimit = 5;
        opt.QueueLimit = 0; // sem fila — rejeita imediatamente
    });

    options.AddPolicy("portfolio-ai", context =>
    {
        var userId = context.User.Identity?.IsAuthenticated == true
            ? context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            : null;
        var partitionKey = !string.IsNullOrWhiteSpace(userId)
            ? $"user:{userId}"
            : $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
        return RateLimitPartition.GetSlidingWindowLimiter(partitionKey, _ => new SlidingWindowRateLimiterOptions
        {
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 6,
            PermitLimit = 5,
            QueueLimit = 0
        });
    });

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync(
            "{\"message\": \"Muitas tentativas. Aguarde um momento e tente novamente.\"}",
            cancellationToken);
    };
});

// Resend
builder.Services.Configure<ResendClientOptions>(options =>
{
    options.ApiToken = builder.Configuration["Resend:ApiKey"]
        ?? throw new InvalidOperationException("Resend:ApiKey não configurada");
});
builder.Services.AddHttpClient<ResendClient>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(frontendUrl, "http://localhost:3000", "http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IEvaluationRepository, EvaluationRepository>();
builder.Services.AddScoped<IEvaluationService, EvaluationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IRankingService, RankingService>();
builder.Services.AddScoped<BadgeService>();
builder.Services.AddHttpClient();
builder.Services.AddHttpClient("portfolio-images", client => client.Timeout = TimeSpan.FromSeconds(12))
    .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler { AllowAutoRedirect = false, ConnectTimeout = TimeSpan.FromSeconds(5) });
builder.Services.AddScoped<IAiReviewService, AiReviewService>();
builder.Services.AddScoped<IPortfolioAiDraftService, PortfolioAiDraftService>();
builder.Services.AddScoped<IStorageService, StorageService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Aplicar migrations automaticamente
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        if (context.Database.IsRelational())
            context.Database.Migrate();
        else
            context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Erro ao aplicar migrations automaticamente");
    }
}

// middleware erro global
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
if (app.Environment.IsDevelopment() && builder.Configuration.GetValue<bool>("Database:UseInMemory"))
{
    var localWebRoot = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
    Directory.CreateDirectory(localWebRoot);
    app.UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(localWebRoot) });
}
else
{
    app.UseStaticFiles();
}

// CSRF: rejeita requisições com cookie jwt vindas de origens não permitidas
var allowedOrigins = new[] { frontendUrl, "http://localhost:3000", "http://localhost:5173" };
app.Use(async (context, next) =>
{
    var hasCookie = context.Request.Cookies.ContainsKey("jwt");
    var isStateChanging = !HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method);

    if (hasCookie && isStateChanging)
    {
        var origin = context.Request.Headers["Origin"].ToString();
        if (!string.IsNullOrEmpty(origin) && !allowedOrigins.Contains(origin))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsync("{\"message\":\"Origin não permitida.\"}");
            return;
        }
    }

    await next();
});

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

app.MapControllers();

app.Run();
