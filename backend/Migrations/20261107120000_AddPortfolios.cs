using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Nexora.Api.Data;

#nullable disable

namespace backend.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261107120000_AddPortfolios")]
public partial class AddPortfolios : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Portfolios",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false).Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                UserId = table.Column<string>(type: "text", nullable: false),
                Slug = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                Headline = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                Bio = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                Skills = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                Theme = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Portfolios", x => x.Id);
                table.ForeignKey("FK_Portfolios_AspNetUsers_UserId", x => x.UserId, "AspNetUsers", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "PortfolioProjects",
            columns: table => new
            {
                PortfolioId = table.Column<int>(type: "integer", nullable: false),
                ProjectId = table.Column<int>(type: "integer", nullable: false),
                SortOrder = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PortfolioProjects", x => new { x.PortfolioId, x.ProjectId });
                table.ForeignKey("FK_PortfolioProjects_Portfolios_PortfolioId", x => x.PortfolioId, "Portfolios", "Id", onDelete: ReferentialAction.Cascade);
                table.ForeignKey("FK_PortfolioProjects_Projects_ProjectId", x => x.ProjectId, "Projects", "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex("IX_Portfolios_Slug", "Portfolios", "Slug", unique: true);
        migrationBuilder.CreateIndex("IX_Portfolios_UserId", "Portfolios", "UserId", unique: true);
        migrationBuilder.CreateIndex("IX_PortfolioProjects_ProjectId", "PortfolioProjects", "ProjectId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("PortfolioProjects");
        migrationBuilder.DropTable("Portfolios");
    }
}
