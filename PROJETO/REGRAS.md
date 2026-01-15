# Regras do Projeto - Portal Analytics Moto Matsuo

## 🎯 Princípio Fundamental

**Todas as informações no portal devem ser utilizadas para estratégia empresarial. Não podemos ter conteúdos irrelevantes ou que atrapalhem a estratégia.**

## 🔍 Processo de Decisão

Antes de adicionar qualquer feature, componente ou informação, sempre se pergunte:

1. **Esta informação é relevante para a estratégia?**
2. **Ela ajuda na tomada de decisão?**
3. **Não vai poluir ou confundir o dashboard?**
4. **O código é necessário ou é apenas "nice to have"?**

## 🚫 Restrições Técnicas

### Frontend
- ❌ **NUNCA** fazer chamadas diretas ao Supabase no frontend
- ❌ **NUNCA** expor logs de API no console
- ❌ **NUNCA** hardcodar credenciais ou valores sensíveis
- ❌ **NUNCA** adicionar código desnecessário que pese a aplicação

### Backend (quando implementado)
- ✅ Todas as chamadas ao Supabase devem passar pelo backend
- ✅ Validar e sanitizar todas as entradas
- ✅ Implementar rate limiting quando necessário
- ✅ Logs apenas no backend (nunca no frontend)

## 📊 Regras de Conteúdo

### Informações Permitidas
- ✅ Métricas estratégicas relevantes
- ✅ Dashboards com KPIs importantes
- ✅ Dados que influenciam decisões empresariais
- ✅ Análises que agregam valor

### Informações Proibidas
- ❌ Dados irrelevantes ou "só por ter"
- ❌ Informações que não são utilizadas
- ❌ Métricas que confundem mais do que ajudam
- ❌ Conteúdo decorativo sem propósito

## 🏗️ Arquitetura

### Estrutura de Dados
- Sempre validar dados antes de exibir
- Tratar erros de forma elegante
- Não mostrar informações sensíveis no frontend

### Performance
- Lazy loading quando apropriado
- Otimizar queries e chamadas de API
- Não carregar dados desnecessários
- Cache quando fizer sentido

## 🎨 UI/UX

### Princípios
- Interface limpa e focada
- Informações apresentadas de forma clara
- Não sobrecarregar o usuário com dados
- Cada elemento deve ter um propósito

### Responsividade
- Design deve funcionar em diferentes tamanhos de tela
- Priorizar informações mais importantes em mobile

## 🔐 Segurança

### Autenticação
- Todas as rotas protegidas devem verificar autenticação
- Sessão deve ser validada em cada requisição
- Logout deve limpar todas as sessões

### Dados
- Não expor dados sensíveis
- Validar permissões antes de exibir informações
- Implementar controle de acesso quando necessário

## 📝 Código

### Qualidade
- TypeScript para type safety
- Código limpo e legível
- Componentes reutilizáveis
- Separação de responsabilidades

### Manutenibilidade
- Comentários apenas quando necessário
- Nomes descritivos
- Estrutura consistente
- Documentação quando apropriado

## 🚀 Deploy e Ambiente

### Variáveis de Ambiente
- Nunca commitar arquivos `.env`
- Usar `.env.example` como template
- Validar variáveis na inicialização

### Build
- Otimizar bundle size
- Remover código não utilizado
- Validar antes de deploy

## ✅ Checklist Antes de Adicionar Feature

- [ ] A informação é relevante para estratégia?
- [ ] Não vai poluir o dashboard?
- [ ] O código é necessário?
- [ ] Segue as regras de segurança?
- [ ] Não expõe dados sensíveis?
- [ ] Performance está otimizada?
- [ ] UI/UX está adequada?
- [ ] TypeScript está correto?
- [ ] Não adiciona dependências desnecessárias?
