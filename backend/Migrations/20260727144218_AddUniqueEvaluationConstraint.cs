using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueEvaluationConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Evaluations_ProjectId",
                table: "Evaluations");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_ProjectId_ProfessorId",
                table: "Evaluations",
                columns: new[] { "ProjectId", "ProfessorId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Evaluations_ProjectId_ProfessorId",
                table: "Evaluations");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_ProjectId",
                table: "Evaluations",
                column: "ProjectId");
        }
    }
}
