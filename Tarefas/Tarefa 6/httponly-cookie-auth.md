# Fix: Migrar autenticação de localStorage para httpOnly cookie

## Objetivo

O token JWT está sendo armazenado no `localStorage`, o que expõe a aplicação a ataques XSS — qualquer script malicioso injetado na página consegue ler o token e se autenticar como o usuário. A solução é mover o token para um `httpOnly cookie`, que é inacessível via JavaScript.

## Contexto

- Frontend: Azure Static Web App (domínio separado)
- Backend: Azure App Service
- Por serem cross-origin, o cookie precisa de `SameSite=None; Secure` (ambos já estão em HTTPS)

## Mudanças necessárias

### Backend

**`Program.cs`**
- Adicionar `AllowCredentials()` na política de CORS
- Configurar `CookiePolicyOptions` com `SameSite=None` e `Secure=true`

**`AuthController.cs`**
- Endpoint `POST /auth/login`: em vez de retornar `{ token }` no body, setar o JWT em um `httpOnly cookie`
- Novo endpoint `POST /auth/logout`: apaga o cookie
- Endpoint `GET /auth/me`: retorna os dados do usuário autenticado (usado pelo frontend para restaurar sessão ao recarregar a página)

**`IAuthService.cs` / `AuthService.cs`**
- Extrair a geração do token do `LoginAsync` para que o controller possa usá-lo para setar o cookie

### Frontend

**`api/axios.ts`**
- Adicionar `withCredentials: true` na instância do axios
- Remover o interceptor que lê o token do `localStorage` e injeta no header `Authorization` (o cookie é enviado automaticamente pelo browser)
- Manter o interceptor de 401 para redirecionar ao login, mas remover o `localStorage.removeItem`

**`contexts/AuthContext.tsx`**
- Remover `useState` e `localStorage` do token
- Ao montar o contexto, chamar `GET /auth/me` para verificar se há sessão ativa (cookie válido)
- `login()` passa a receber apenas o objeto `User`, sem o token
- `logout()` chama `POST /auth/logout` no backend antes de limpar o estado

**`features/auth/hooks/useAuthForm.ts`**
- Remover o manuseio do token (`response.data.token`, `api.defaults.headers...`)
- Após login bem-sucedido, chamar `GET /auth/me` para obter o usuário e passar para `login(user)`
