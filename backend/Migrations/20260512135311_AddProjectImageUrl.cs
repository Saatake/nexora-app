using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectImageUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Projects'
          AND column_name = 'ImageUrl'
    ) THEN
        ALTER TABLE ""Projects"" ADD COLUMN ""ImageUrl"" character varying(500);
    END IF;
END $$;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Projects'
          AND column_name = 'ImageUrl'
    ) THEN
        ALTER TABLE ""Projects"" DROP COLUMN ""ImageUrl"";
    END IF;
END $$;
");
        }
    }
}
