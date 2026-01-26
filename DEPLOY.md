# 🚀 Deploy na Vercel - SmartList AI

## Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Repositório no GitHub (já configurado)

## Passos para Deploy

### 1. Importar Projeto na Vercel
1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte sua conta do GitHub
3. Selecione o repositório `darksoundro-hash/SmartList`
4. Clique em **Import**

### 2. Configurar Variáveis de Ambiente
Na tela de configuração do projeto, adicione as seguintes variáveis de ambiente:

```
VITE_SUPABASE_URL=https://ynmlyuqcuuwwicpnmkkk.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

> ⚠️ **IMPORTANTE**: Substitua os valores acima pelas suas chaves reais do Supabase e Google Gemini.

### 3. Deploy
1. Clique em **Deploy**
2. Aguarde o build completar (leva cerca de 1-2 minutos)
3. Seu app estará disponível em `https://seu-projeto.vercel.app`

## Configuração do Supabase

### Adicionar URL da Vercel nas Configurações
1. Acesse o painel do Supabase
2. Vá em **Settings** > **API**
3. Em **Site URL**, adicione a URL do seu deploy na Vercel
4. Em **Redirect URLs**, adicione:
   - `https://seu-projeto.vercel.app`
   - `https://seu-projeto.vercel.app/**`

## Atualizações Futuras
Sempre que você fizer push para o GitHub, a Vercel automaticamente:
- Detecta as mudanças
- Faz o build
- Atualiza o deploy

## Troubleshooting

### Build falha
- Verifique se todas as variáveis de ambiente estão configuradas
- Confira os logs de build na Vercel

### Erro de autenticação
- Confirme que as URLs da Vercel estão cadastradas no Supabase
- Verifique se as chaves do Supabase estão corretas

### Página em branco
- Verifique o console do navegador para erros
- Confirme que o `vercel.json` está configurado corretamente para SPA routing

## Histórico de Deploys
- **14/01/2026**: Otimização Mobile Completa (Drawer, Grid, ListDetails responsivo) - Push Manual para Trigger.
