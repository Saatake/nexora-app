using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaAprovacaoProjeto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // mapeia valores texto para inteiros e converte a coluna
            migrationBuilder.Sql(@"
                UPDATE ""AspNetUsers"" SET ""RoleType"" = '1' WHERE LOWER(""RoleType"") IN ('estudante', 'aluno', 'student');
                UPDATE ""AspNetUsers"" SET ""RoleType"" = '2' WHERE LOWER(""RoleType"") IN ('professor', 'teacher');
                UPDATE ""AspNetUsers"" SET ""RoleType"" = '1' WHERE ""RoleType"" !~ '^\d+$';
                ALTER TABLE ""AspNetUsers"" ALTER COLUMN ""RoleType"" TYPE integer USING ""RoleType""::integer;
            ");

            // garante que a tabela Projects tem todas as colunas esperadas
            migrationBuilder.Sql(@"
                ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""Category"" integer NOT NULL DEFAULT 1;
                ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""IsApproved"" boolean NOT NULL DEFAULT false;
                ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""GithubLink"" text NOT NULL DEFAULT '';
                ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""ImageUrl"" text NOT NULL DEFAULT '';
                ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT now();
                CREATE INDEX IF NOT EXISTS ""IX_Projects_UserId"" ON ""Projects"" (""UserId"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER TABLE ""Projects"" DROP COLUMN IF EXISTS ""IsApproved"";");

            migrationBuilder.AlterColumn<string>(
                name: "RoleType",
                table: "AspNetUsers",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }
    }
}
