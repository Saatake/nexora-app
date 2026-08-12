using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceProjectCourseAreaWithThematicAreaAndTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Area",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Course",
                table: "Projects");

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Projects",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ThematicArea",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "AcademicContribution",
                table: "Evaluations",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "ExecutionFeasibility",
                table: "Evaluations",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TheoreticalFoundation",
                table: "Evaluations",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Formation",
                table: "AspNetUsers",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "UserTeachingAreas",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Area = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTeachingAreas", x => new { x.UserId, x.Area });
                    table.ForeignKey(
                        name: "FK_UserTeachingAreas_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserTeachingAreas");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ThematicArea",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "AcademicContribution",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "ExecutionFeasibility",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "TheoreticalFoundation",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "Formation",
                table: "AspNetUsers");

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
        }
    }
}
