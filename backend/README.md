# Backend - Portal Analytics Moto Matsuo

Backend Node.js/Express que intermedia todas as chamadas ao Supabase, garantindo que nenhuma credencial ou informação sensível seja exposta no frontend.

## 🚀 Início Rápido

### Instalação

```bash
cd backend
npm install
```

### Configuração

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```
PORT=3001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
JWT_SECRET=sua_chave_secreta_jwt_mude_em_producao
```

**Importante:**
- `SUPABASE_ANON_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`: Usada para acessar o banco de dados
- `JWT_SECRET`: Chave secreta para assinar os tokens JWT (mude em produção!)
- A autenticação usa a tabela `db_login_portal` do Supabase

### Executar

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

## 📡 Endpoints

### Autenticação

#### POST `/api/auth/signin`
Autentica um usuário.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Resposta de sucesso:**
```json
{
  "user": {
    "id": "1",
    "email": "usuario@example.com",
    "nome": "Nome do Usuário",
    "funcao": "Função",
    "foto_perfil": "url_da_foto"
  },
  "session": {
    "access_token": "jwt_token"
  }
}
```

#### POST `/api/auth/signout`
Faz logout do usuário.

**Headers:**
```
Authorization: Bearer {access_token}
```

#### GET `/api/auth/session`
Verifica a sessão atual do usuário.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Resposta:**
```json
{
  "user": {
    "id": "1",
    "email": "usuario@example.com",
    "nome": "Nome do Usuário",
    "funcao": "Função",
    "foto_perfil": "url_da_foto"
  }
}
```

**Nota:** A autenticação valida:
- Email existe na tabela `db_login_portal` (campo `email_vend`)
- Senha corresponde ao campo `senha_vend`
- Status do usuário não é "inativo"

## 🔐 Segurança

- Todas as credenciais do Supabase ficam apenas no backend
- O frontend nunca acessa o Supabase diretamente
- Autenticação baseada na tabela `db_login_portal` (não usa Supabase Auth)
- Tokens JWT são gerenciados via localStorage no frontend
- CORS configurado para aceitar apenas o frontend autorizado
- Senhas são comparadas diretamente (considere implementar hash se necessário)

## 📁 Estrutura

```
backend/
├── src/
│   ├── index.ts          # Servidor Express
│   ├── lib/
│   │   └── supabase.ts   # Cliente Supabase
│   └── routes/
│       └── auth.ts       # Rotas de autenticação
├── package.json
└── tsconfig.json
```
