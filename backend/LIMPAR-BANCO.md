# 🗑️ Como Limpar o Banco de Dados

## Opção 1: SQL Direto (Recomendado)

### Pelo Neon Dashboard:
1. Acesse: https://console.neon.tech/
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo de `limpar-banco.sql`
5. Execute

### Pelo VSCode (se tiver extensão PostgreSQL):
1. Conecte no banco Neon
2. Abra `limpar-banco.sql`
3. Execute o script

---

## Opção 2: Resetar Migrations (Mais Radical)

⚠️ **ATENÇÃO:** Isso apaga TUDO e recria as tabelas do zero!

```bash
cd backend

# 1. Apagar o banco pelo Neon Dashboard ou SQL:
# DROP SCHEMA public CASCADE;
# CREATE SCHEMA public;

# 2. Rodar migrations novamente:
dotnet ef database update

# Isso vai recriar todas as tabelas vazias
```

---

## Opção 3: Limpar via Script C# (se preferir)

```bash
cd backend
dotnet script fix-db.csx
```

---

## 🔄 Como Rodar Migrations

### Ver migrations disponíveis:
```bash
cd backend
dotnet ef migrations list
```

### Aplicar todas as migrations:
```bash
dotnet ef database update
```

### Criar nova migration:
```bash
dotnet ef migrations add NomeDaMigracao
```

### Reverter última migration:
```bash
dotnet ef migrations remove
```

### Voltar para migration específica:
```bash
dotnet ef database update NomeDaMigration
```

---

## 🎯 Resumo Rápido

**Para limpar dados mantendo estrutura:**
- Use `limpar-banco.sql` no Neon Dashboard

**Para resetar tudo do zero:**
```bash
# No Neon SQL Editor:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# No terminal:
cd backend
dotnet ef database update
```

Pronto! Banco limpo! 🧹
