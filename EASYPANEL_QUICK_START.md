# 🚀 Quick Start - Deploy no Easypanel

Guia rápido para fazer deploy no Easypanel.

## 📋 Estrutura de Dockerfiles

- **`Dockerfile`** → Frontend (padrão, usado pelo Easypanel se não especificar)
- **`Dockerfile.backend`** → Backend (especifique no Easypanel)
- **`Dockerfile.frontend`** → Frontend alternativo (mesmo que `Dockerfile`)

## 🎯 Deploy do Frontend

1. **Criar Novo Serviço no Easypanel:**
   - Nome: `analytics-frontend`
   - Tipo: **Docker**
   - Repositório: Seu repositório GitHub
   - Branch: `main`

2. **Configurações de Build:**
   - **Dockerfile**: Deixe vazio ou use `Dockerfile` (padrão)
   - **Context**: `/` (raiz)
   - **Build Args**:
     ```
     VITE_API_URL=https://seu-dominio-backend.com
     ```
     ⚠️ Use a URL do backend que você vai configurar depois

3. **Porta:**
   - Porta Interna: `80`
   - Porta Externa: Configure conforme necessário

4. **Variáveis de Ambiente:**
   - Nenhuma necessária para o frontend (tudo é build-time)

## 🎯 Deploy do Backend

1. **Criar Novo Serviço no Easypanel:**
   - Nome: `analytics-backend`
   - Tipo: **Docker**
   - Repositório: Seu repositório GitHub
   - Branch: `main`

2. **Configurações de Build:**
   - **Dockerfile**: `Dockerfile.backend` ⚠️ **IMPORTANTE: Especifique aqui!**
   - **Context**: `/` (raiz)
   - **Build Command**: (deixe vazio)

3. **Porta:**
   - Porta Interna: `3001`
   - Porta Externa: Configure conforme necessário

4. **Variáveis de Ambiente:**
   ```
   PORT=3001
   FRONTEND_URL=https://seu-dominio-frontend.com
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
   JWT_SECRET=chave_secreta_forte_aleatoria_aqui
   ```

5. **Health Check:**
   - Path: `/health`
   - Interval: `30s`
   - Timeout: `10s`
   - Retries: `3`

## ⚠️ Erro Comum: "no such file or directory"

Se você receber o erro:
```
ERROR: failed to build: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

**Solução:**
1. Para o **Frontend**: Deixe o campo Dockerfile vazio (usa `Dockerfile` por padrão)
2. Para o **Backend**: Especifique `Dockerfile.backend` no campo Dockerfile

## 🔄 Ordem Recomendada de Deploy

1. **Primeiro**: Deploy do Backend
   - Configure todas as variáveis de ambiente
   - Anote a URL do backend

2. **Segundo**: Deploy do Frontend
   - Use a URL do backend no `VITE_API_URL` (Build Args)
   - Atualize `FRONTEND_URL` no backend com a URL do frontend

3. **Teste**: Acesse o frontend e verifique se está funcionando

## 📝 Checklist Rápido

### Backend
- [ ] Dockerfile: `Dockerfile.backend`
- [ ] Porta: `3001`
- [ ] Variáveis de ambiente configuradas
- [ ] Health check configurado
- [ ] URL do backend anotada

### Frontend
- [ ] Dockerfile: vazio ou `Dockerfile`
- [ ] Build Args: `VITE_API_URL` com URL do backend
- [ ] Porta: `80`
- [ ] `FRONTEND_URL` atualizado no backend

## 🆘 Troubleshooting

### Backend não inicia
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique os logs no Easypanel
- Confirme que `Dockerfile.backend` está especificado

### Frontend não carrega
- Verifique se `VITE_API_URL` está correto (deve ser a URL do backend)
- Verifique se o build foi concluído
- Confirme que o backend está acessível

### Erro de CORS
- Verifique se `FRONTEND_URL` no backend está correto
- Use HTTPS em ambos os serviços
- Confirme que os domínios estão corretos
