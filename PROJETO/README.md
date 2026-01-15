# Portal Analytics - Moto Matsuo

## 📋 Visão Geral

Portal de analytics administrativo para a Moto Matsuo, desenvolvido para fornecer uma visão geral estratégica de todas as frentes digitais da empresa.

## 🎯 Objetivo

Fornecer informações estratégicas e relevantes para tomada de decisão empresarial. **Todas as informações devem ser úteis e não podem atrapalhar a estratégia.**

## 🛠️ Stack Tecnológica

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Roteamento**: React Router DOM
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: Supabase
- **Autenticação**: Tabela customizada `db_login_portal` + JWT (via backend)

## 📐 Arquitetura

### Estrutura de Pastas

```
analyticsAdm/
├── backend/        # API Backend
│   ├── src/
│   │   ├── routes/ # Rotas da API
│   │   └── lib/    # Configurações (Supabase)
│   └── package.json
├── src/            # Frontend
│   ├── components/ # Componentes reutilizáveis
│   ├── contexts/   # Contextos React (Auth, etc)
│   ├── lib/        # Cliente API (não Supabase direto)
│   ├── pages/      # Páginas da aplicação
│   └── App.tsx     # Componente principal
└── package.json
```

### Fluxo de Autenticação

1. Usuário acessa `/login`
2. Frontend envia credenciais para `POST /api/auth/signin` (backend)
3. Backend autentica no Supabase e retorna token
4. Frontend armazena token e redireciona para `/`
5. Rotas protegidas verificam autenticação via `AuthContext`
6. `AuthContext` valida token com `GET /api/auth/session` (backend)
7. Se não autenticado, redireciona para `/login`

**Importante:** O frontend NUNCA acessa o Supabase diretamente. Todas as chamadas passam pelo backend.

### Estrutura de Rotas

```
/login
  └── Página de login

/ (protegida)
  └── Layout
      ├── Sidebar
      ├── Header
      └── Home (em manutenção)
```

## 🔐 Segurança

### Regras Importantes

1. **Nunca exponha chamadas de API no console do frontend**
2. **Todas as requisições ao Supabase devem passar por backend**
3. **Variáveis de ambiente devem estar no `.env` (não commitadas)**
4. **Autenticação obrigatória para todas as rotas protegidas**

## 📝 Regras de Desenvolvimento

### ✅ O QUE FAZER

- Pensar criticamente antes de adicionar qualquer feature
- Validar se a informação é relevante para estratégia empresarial
- Manter código limpo e organizado
- Usar TypeScript para type safety
- Seguir a estrutura de pastas estabelecida
- Documentar decisões importantes

### ❌ O QUE NÃO FAZER

- Adicionar código irrelevante ou que pese a aplicação
- Expor chamadas de API no console do frontend
- Adicionar informações que não agregam valor estratégico
- Criar componentes desnecessários
- Hardcode de valores sensíveis

## 🎨 Design e UX

### Princípios

- Interface limpa e moderna
- Foco na usabilidade
- Informações apresentadas de forma clara
- Design responsivo

### Componentes Base

- **Sidebar**: Navegação lateral fixa
- **Header**: Cabeçalho com informações do usuário
- **Layout**: Container principal que organiza Sidebar + Header + Content

## 🚀 Como Iniciar

1. **Configurar Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Editar backend/.env com credenciais do Supabase
npm run dev
```

2. **Configurar Frontend (em outro terminal):**
```bash
npm install
cp .env.example .env
# Editar .env com VITE_API_URL=http://localhost:3001
npm run dev
```

3. Acessar `http://localhost:5173`

## 📦 Estrutura Atual

### Páginas

- **Login**: Autenticação de usuários
- **Home**: Em manutenção (será desenvolvida conforme necessidade)

### Componentes

- **Layout**: Container principal com Sidebar e Header
- **Sidebar**: Navegação lateral (atualmente apenas Home)
- **Header**: Cabeçalho com email do usuário e botão de logout

## 🔄 Próximos Passos

Conforme o desenvolvimento avança, novas features serão adicionadas seguindo estas regras e mantendo o foco em informações estratégicas relevantes.

## 📚 Referências

- [Documentação Supabase](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)
