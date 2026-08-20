using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBadgeUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProjectBadges_ProjectId_Badge",
                table: "ProjectBadges");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectBadges_ProjectId_Badge_ProfessorId",
                table: "ProjectBadges",
                columns: new[] { "ProjectId", "Badge", "ProfessorId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProjectBadges_ProjectId_Badge_ProfessorId",
                table: "ProjectBadges");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectBadges_ProjectId_Badge",
                table: "ProjectBadges",
                columns: new[] { "ProjectId", "Badge" },
                unique: true);
        }
    }
}
