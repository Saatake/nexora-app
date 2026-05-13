# Ágora — Plataforma Acadêmica

> Plataforma digital para publicação e acompanhamento de projetos acadêmicos, desenvolvida como projeto da disciplina de Desenvolvimento Web na **Facens**.

---

**Link do Ágora:** https://victorious-sand-036efd210.7.azurestaticapps.net  

## Sobre o Projeto

O **Ágora** é uma plataforma onde estudantes universitários podem publicar seus projetos acadêmicos, receber feedbacks de professores e interagir com outros alunos. O objetivo é centralizar e dar visibilidade aos trabalhos produzidos dentro da universidade, promovendo uma cultura de melhoria contínua e colaboração.

 **Video Pitch:** [Assistir no YouTube](https://www.youtube.com/watch?v=TGFyxHVJmjs)

---

## Público-Alvo

- **Estudantes universitários** — publicam e acompanham seus projetos
- **Professores** — fornecem feedback e avaliam os trabalhos
- **Recrutadores** — descobrem talentos e projetos relevantes

---

## Funcionalidades

- Cadastro e autenticação de usuários (estudantes e professores) com confirmação por e-mail
- Publicação de projetos acadêmicos com imagens e links
- Sistema de comentários e avaliações
- Dashboard pessoal com resumo de atividades
- Exploração e busca de projetos de outros usuários
- Ranking de projetos mais avaliados
- Edição de perfil com foto
- Recuperação de senha por e-mail

---

## Tecnologias Utilizadas

### Frontend
| Tecnologia | Descrição |
|---|---|
| React 19 | Biblioteca principal de UI |
| TypeScript | Tipagem estática |
| Vite | Bundler e servidor de desenvolvimento |
| Tailwind CSS v4 | Estilização utilitária |
| React Router DOM v7 | Roteamento |
| Axios | Requisições HTTP |
| Lucide React | Biblioteca de ícones |
| React Easy Crop | Recorte de imagens no upload |

### Backend
| Tecnologia | Descrição |
|---|---|
| ASP.NET Core (.NET 10) | Framework web |
| Entity Framework Core | ORM para acesso ao banco de dados |
| PostgreSQL (Neon) | Banco de dados relacional em nuvem |
| ASP.NET Identity | Gerenciamento de usuários e roles |
| JWT Bearer | Autenticação via tokens |
| Azure Blob Storage | Armazenamento de imagens e arquivos |
| SendGrid + MailKit | Envio de e-mails transacionais |
| Swagger / OpenAPI | Documentação da API |

### Infraestrutura & DevOps
| Tecnologia | Descrição |
|---|---|
| Azure Static Web Apps | Hospedagem do frontend |
| Azure App Service | Hospedagem do backend |
| GitHub Actions | CI/CD automatizado |

---

## Estrutura do Projeto

```
nexora-app/
├── agora-frontend/         # Frontend principal (React + Vite)
│   ├── src/
│   │   ├── api/            # Configuração do Axios
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── contexts/       # Contextos de Auth e Tema
│   │   ├── pages/          # Páginas da aplicação
│   │   └── routes/         # Definição de rotas
│   └── public/
├── backend/                # API REST (ASP.NET Core)
│   ├── Controllers/        # Endpoints da API
│   ├── Services/           # Lógica de negócio
│   ├── Models/             # Entidades do banco
│   ├── Dtos/               # Objetos de transferência de dados
│   ├── Repositories/       # Acesso a dados
│   ├── Migrations/         # Migrações do banco de dados
│   └── Middlewares/        # Middlewares customizados
├── frontend/               # Versão alternativa (Next.js)
├── Tarefas/                # Documentação e entregas da disciplina
└── .github/workflows/      # Pipelines de CI/CD
```

---

## Como Executar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [.NET SDK 10](https://dotnet.microsoft.com/download)
- PostgreSQL ou acesso a um banco Neon

### Frontend

```bash
cd agora-frontend
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

### Backend

1. Copie o arquivo de configuração de exemplo e preencha as variáveis:

```bash
cp backend/appsettings.example.json backend/appsettings.json
# Edite o appsettings.json com suas credenciais
```

2. Execute as migrações e inicie o servidor:

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

A API estará disponível em `http://localhost:5000`.  
A documentação Swagger ficará em `http://localhost:5000/swagger`.

---

## Deploy

| Serviço | URL |
|---|---|
| Frontend | Azure Static Web Apps |
| Backend (API) | Azure App Service — `agoraapp` |

O deploy é feito automaticamente via **GitHub Actions** a cada push na branch `main`.

---

## Integrantes

| Nome | GitHub |
|---|---|
| Diego Carvalho | [@diegocdg04](https://github.com/Diegao-ship-it) |
| Edson Satake | [@Saatake](https://github.com/Saatake) |
| Felipe Brito | [@](https://github.com/Felupx) |
| Rafael Rocha | [@](https://github.com/dev-RafaelRocha) |

---

## Licença

Este projeto foi desenvolvido para fins acadêmicos na **Facens — Faculdade de Engenharia de Sorocaba**.

