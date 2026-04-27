using Npgsql;

var connStr = "Host=ep-floral-water-annltyyr.c-6.us-east-1.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_UXnzJ8ft5dRa;SSL Mode=Require";

var sql = @"
    ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""Category"" integer NOT NULL DEFAULT 1;
    ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""GithubLink"" text NOT NULL DEFAULT '';
    ALTER TABLE ""Projects"" ADD COLUMN IF NOT EXISTS ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT now();
";

await using var conn = new NpgsqlConnection(connStr);
await conn.OpenAsync();
await using var cmd = new NpgsqlCommand(sql, conn);
await cmd.ExecuteNonQueryAsync();
Console.WriteLine("Colunas adicionadas com sucesso!");
