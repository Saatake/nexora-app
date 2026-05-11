-- ⚠️ ATENÇÃO: Este script APAGA TODOS OS DADOS do banco!
-- Use apenas em ambiente de desenvolvimento/teste

-- Desabilitar constraints temporariamente
SET session_replication_role = 'replica';

-- Limpar tabelas do domínio
TRUNCATE TABLE "Comments" CASCADE;
TRUNCATE TABLE "Evaluations" CASCADE;
TRUNCATE TABLE "Projects" CASCADE;

-- Limpar tabelas do Identity
TRUNCATE TABLE "AspNetUserTokens" CASCADE;
TRUNCATE TABLE "AspNetUserRoles" CASCADE;
TRUNCATE TABLE "AspNetUserLogins" CASCADE;
TRUNCATE TABLE "AspNetUserClaims" CASCADE;
TRUNCATE TABLE "AspNetRoleClaims" CASCADE;
TRUNCATE TABLE "AspNetUsers" CASCADE;
TRUNCATE TABLE "AspNetRoles" CASCADE;

-- Reabilitar constraints
SET session_replication_role = 'origin';

-- Mensagem de sucesso
SELECT 'Banco de dados limpo com sucesso!' as resultado;
