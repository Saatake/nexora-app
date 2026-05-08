using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Advisor",
                table: "Projects",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Area",
                table: "Projects",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Course",
                table: "Projects",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "Projects",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TeamMembers",
                table: "Projects",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Advisor",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Area",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Course",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "TeamMembers",
                table: "Projects");
        }
    }
}
