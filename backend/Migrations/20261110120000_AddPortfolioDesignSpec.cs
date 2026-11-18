using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Nexora.Api.Data;

#nullable disable

namespace backend.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261110120000_AddPortfolioDesignSpec")]
public partial class AddPortfolioDesignSpec : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "DesignSpecJson",
            table: "Portfolios",
            type: "jsonb",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "DesignSpecJson", table: "Portfolios");
    }
}
