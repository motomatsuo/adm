# 📦 Configuração Inicial do GitHub

Este guia ajuda você a fazer o primeiro commit e push do projeto para o GitHub.

## 🔧 Passo a Passo

### 1. Inicializar Git (se ainda não foi feito)

```bash
git init
```

### 2. Adicionar Remote do GitHub

```bash
git remote add origin https://github.com/seu-usuario/analytics-adm.git
```

Ou se preferir SSH:
```bash
git remote add origin git@github.com:seu-usuario/analytics-adm.git
```

### 3. Verificar Arquivos a Serem Commitados

```bash
git status
```

Certifique-se de que:
- ✅ `.env` NÃO está listado (deve estar no `.gitignore`)
- ✅ `node_modules` NÃO está listado
- ✅ Arquivos de build (`dist`, `build`) NÃO estão listados

### 4. Adicionar Arquivos

```bash
git add .
```

### 5. Fazer o Primeiro Commit

```bash
git commit -m "feat: configuração inicial do projeto - Portal Analytics Moto Matsuo"
```

### 6. Criar Branch Main (se necessário)

```bash
git branch -M main
```

### 7. Fazer Push para o GitHub

```bash
git push -u origin main
```

## ✅ Checklist Antes do Commit

- [ ] `.env` está no `.gitignore`
- [ ] `node_modules` está no `.gitignore`
- [ ] Arquivos de build estão no `.gitignore`
- [ ] Todas as credenciais sensíveis foram removidas
- [ ] `.env.example` existe e está atualizado
- [ ] `README.md` está atualizado
- [ ] Documentação está completa

## 🔐 Segurança

**NUNCA commite:**
- ❌ Arquivos `.env` com credenciais reais
- ❌ Chaves de API
- ❌ Senhas
- ❌ Tokens de acesso
- ❌ Certificados SSL

**SEMPRE use:**
- ✅ `.env.example` como template
- ✅ Variáveis de ambiente no servidor
- ✅ Secrets do GitHub (se usar GitHub Actions)
- ✅ Variáveis de ambiente do Easypanel

## 📝 Estrutura de Commits Recomendada

Use mensagens de commit descritivas:

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração de código
test: adiciona testes
chore: atualiza dependências
```

## 🚀 Após o Push

1. Verifique se todos os arquivos foram enviados corretamente
2. Configure branch protection (recomendado)
3. Configure secrets no GitHub (se usar CI/CD)
4. Siga para o deploy no Easypanel usando `DEPLOY.md`
