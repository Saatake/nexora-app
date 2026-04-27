using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Nexora.Api.Data;
using Nexora.Api.Models;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Nexora.Api.Services;
using Nexora.Api.Interfaces;
using Nexora.Api.Repositories;
using Nexora.Api.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// injeta banco e identity
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddIdentityApiEndpoints<ApplicationUser>().AddEntityFrameworkStores<AppDbContext>();

// configura jwt
var jwtKey = builder.Configuration["Jwt:Key"];
var keyBytes = Encoding.UTF8.GetBytes(jwtKey!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
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
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// injeta os servicos
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
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// corrige colunas faltando na tabela Projects (executa apenas uma vez, safe com IF NOT EXISTS)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.ExecuteSqlRaw(@"
        ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""Category"" integer NOT NULL DEFAULT 1;
        ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""GithubLink"" text NOT NULL DEFAULT '';
        ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT now();
        ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""IsApproved"" boolean NOT NULL DEFAULT false;
        ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""ViewCount"" integer NOT NULL DEFAULT 0;
        ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""DownloadCount"" integer NOT NULL DEFAULT 0;
        DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Projects' AND column_name='ImageUrl')
               AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Projects' AND column_name='FileUrl')
            THEN ALTER TABLE ""Projects"" RENAME COLUMN ""ImageUrl"" TO ""FileUrl"";
            END IF;
        END $$;
        ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""FileUrl"" text NOT NULL DEFAULT '';
    ");
}

// middleware de erros globais (tem que ser o primeiro)
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS 
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();