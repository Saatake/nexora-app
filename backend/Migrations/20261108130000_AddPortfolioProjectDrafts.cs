using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Nexora.Api.Data;

#nullable disable

namespace backend.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261108130000_AddPortfolioProjectDrafts")]
public partial class AddPortfolioProjectDrafts : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "PortfolioSummary", table: "PortfolioProjects", type: "character varying(1200)", maxLength: 1200, nullable: true);
        migrationBuilder.AddColumn<string>(name: "Contribution", table: "PortfolioProjects", type: "character varying(800)", maxLength: 800, nullable: true);
        migrationBuilder.AddColumn<string>(name: "VisualSummary", table: "PortfolioProjects", type: "character varying(500)", maxLength: 500, nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "PortfolioSummary", table: "PortfolioProjects");
        migrationBuilder.DropColumn(name: "Contribution", table: "PortfolioProjects");
        migrationBuilder.DropColumn(name: "VisualSummary", table: "PortfolioProjects");
    }
}
