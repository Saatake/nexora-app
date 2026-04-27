using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaComentariosAvaliacoesEContadores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // idempotente: colunas já podem existir via Program.cs
            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Projects' AND column_name='ImageUrl')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Projects' AND column_name='FileUrl')
                    THEN ALTER TABLE ""Projects"" RENAME COLUMN ""ImageUrl"" TO ""FileUrl"";
                    END IF;
                END $$;
                ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""FileUrl"" text NOT NULL DEFAULT '';
                ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""DownloadCount"" integer NOT NULL DEFAULT 0;
                ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""ViewCount"" integer NOT NULL DEFAULT 0;
            ");

            migrationBuilder.CreateTable(
                name: "Comments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Text = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comments_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comments_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Evaluations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Relevance = table.Column<double>(type: "double precision", nullable: false),
                    Quality = table.Column<double>(type: "double precision", nullable: false),
                    Methodology = table.Column<double>(type: "double precision", nullable: false),
                    Presentation = table.Column<double>(type: "double precision", nullable: false),
                    Innovation = table.Column<double>(type: "double precision", nullable: false),
                    Feedback = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProfessorId = table.Column<string>(type: "text", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Evaluations_AspNetUsers_ProfessorId",
                        column: x => x.ProfessorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Evaluations_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_ProjectId",
                table: "Comments",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_UserId",
                table: "Comments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_ProfessorId",
                table: "Evaluations",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_Evaluations_ProjectId",
                table: "Evaluations",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Comments");

            migrationBuilder.DropTable(
                name: "Evaluations");

            migrationBuilder.DropColumn(
                name: "DownloadCount",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "Projects");

            migrationBuilder.RenameColumn(
                name: "FileUrl",
                table: "Projects",
                newName: "ImageUrl");
        }
    }
}
