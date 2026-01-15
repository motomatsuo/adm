# 🚀 Guia de Deploy - Portal Analytics Moto Matsuo

Este guia detalha o processo de deploy do Portal Analytics no Easypanel.

## 📋 Pré-requisitos

- Conta no Easypanel
- Repositório no GitHub
- Credenciais do Supabase
- Domínio configurado (opcional, mas recomendado)

## 🔧 Passo a Passo

### 1. Preparar o Repositório GitHub

1. Certifique-se de que todos os arquivos estão commitados:
```bash
git add .
git commit -m "Preparar para deploy"
git push origin main
```

2. Verifique se o `.gitignore` está configurado corretamente (não commitar `.env`)

### 2. Configurar Backend no Easypanel

1. **Criar Novo Serviço:**
   - Nome: `analytics-backend`
   - Tipo: **Docker**
   - Repositório: Seu repositório GitHub
   - Branch: `main` (ou sua branch de produção)

2. **Configurações de Build:**
   - Dockerfile: `Dockerfile.backend`
   - Context: `/` (raiz do repositório)
   - Build Command: (deixe vazio, o Dockerfile já faz o build)

3. **Variáveis de Ambiente:**
   Adicione as seguintes variáveis no Easypanel:
   ```
   PORT=3001
   FRONTEND_URL=https://seu-dominio-frontend.com
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
   JWT_SECRET=chave_secreta_forte_aleatoria_aqui
   ```

   ⚠️ **Importante**: 
   - Gere um `JWT_SECRET` forte (use um gerador de senhas)
   - `FRONTEND_URL` deve ser a URL completa do frontend (com https://)
   - Nunca compartilhe as chaves do Supabase

4. **Porta:**
   - Porta Interna: `3001`
   - Porta Externa: Configure conforme necessário

5. **Health Check:**
   - Path: `/health`
   - Interval: `30s`
   - Timeout: `10s`
   - Retries: `3`

6. **Restart Policy:**
   - Configure como `always` para reiniciar automaticamente

### 3. Configurar Frontend no Easypanel

1. **Criar Novo Serviço:**
   - Nome: `analytics-frontend`
   - Tipo: **Docker**
   - Repositório: Seu repositório GitHub
   - Branch: `main` (ou sua branch de produção)

2. **Configurações de Build:**
   - Dockerfile: `Dockerfile.frontend`
   - Context: `/` (raiz do repositório)
   - Build Args:
     ```
     VITE_API_URL=https://seu-dominio-backend.com
     ```
     ⚠️ Substitua pela URL real do backend configurada no Easypanel

3. **Porta:**
   - Porta Interna: `80`
   - Porta Externa: Configure conforme necessário

4. **Dependências:**
   - Marque `backend` como dependência (se o Easypanel suportar)

5. **Restart Policy:**
   - Configure como `always`

### 4. Configurar Domínios (Opcional mas Recomendado)

1. **Backend:**
   - Configure um domínio (ex: `api.motomatsuo.com`)
   - Configure SSL/HTTPS no Easypanel

2. **Frontend:**
   - Configure um domínio (ex: `analytics.motomatsuo.com`)
   - Configure SSL/HTTPS no Easypanel

3. **Atualizar Variáveis de Ambiente:**
   - Após configurar os domínios, atualize:
     - `FRONTEND_URL` no backend para o domínio do frontend
     - `VITE_API_URL` no frontend para o domínio do backend

### 5. Verificar Deploy

1. **Backend:**
   - Acesse: `https://seu-dominio-backend.com/health`
   - Deve retornar: `{"status":"ok"}`

2. **Frontend:**
   - Acesse: `https://seu-dominio-frontend.com`
   - Deve carregar a página de login

3. **Teste de Login:**
   - Tente fazer login com credenciais válidas
   - Verifique se a comunicação frontend-backend está funcionando

## 🔍 Troubleshooting

### Backend não inicia

1. Verifique os logs no Easypanel
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Verifique se o Supabase está acessível
4. Confirme que a porta 3001 está correta

### Frontend não carrega

1. Verifique os logs no Easypanel
2. Confirme que o `VITE_API_URL` está correto
3. Verifique se o backend está acessível
4. Confirme que o build foi concluído com sucesso

### Erro de CORS

1. Verifique se `FRONTEND_URL` no backend está correto
2. Confirme que está usando HTTPS em ambos os serviços
3. Verifique se os domínios estão configurados corretamente

### Erro de Autenticação

1. Verifique se `JWT_SECRET` está configurado
2. Confirme que as credenciais do Supabase estão corretas
3. Verifique se a tabela `db_login_portal` existe e tem dados

## 📊 Monitoramento

Configure no Easypanel:
- Health checks para ambos os serviços
- Alertas para falhas
- Logs centralizados
- Métricas de uso

## 🔄 Atualizações

Para atualizar o deploy:

1. Faça push das alterações para o GitHub
2. No Easypanel, clique em "Redeploy" ou configure auto-deploy
3. Aguarde o build e deploy completarem
4. Verifique se os serviços estão rodando corretamente

## 🔐 Segurança

- ✅ Nunca commite arquivos `.env`
- ✅ Use variáveis de ambiente do Easypanel
- ✅ Configure HTTPS/SSL
- ✅ Use `JWT_SECRET` forte e único
- ✅ Mantenha as chaves do Supabase seguras
- ✅ Configure CORS corretamente
- ✅ Use health checks para monitoramento

## 📝 Checklist de Deploy

- [ ] Repositório no GitHub configurado
- [ ] Backend configurado no Easypanel
- [ ] Frontend configurado no Easypanel
- [ ] Variáveis de ambiente configuradas
- [ ] Domínios configurados (opcional)
- [ ] SSL/HTTPS configurado
- [ ] Health checks funcionando
- [ ] Teste de login funcionando
- [ ] Monitoramento configurado

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs no Easypanel
2. Consulte a documentação do Easypanel
3. Verifique a documentação do projeto em `PROJETO/README.md`
