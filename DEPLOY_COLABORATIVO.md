# Deploy colaborativo do Revenue Forecast CRM

Este projeto precisa de duas partes para gerar um link compartilhavel:

1. **Frontend hospedado**: Vercel, Netlify ou Firebase Hosting.
2. **Banco central**: Supabase, Firebase ou outro backend.

## Caminho recomendado

Use **Vercel + Supabase**.

### 1. Criar o banco no Supabase

1. Acesse `https://supabase.com`.
2. Crie um novo projeto.
3. Abra `SQL Editor`.
4. Cole e execute o conteúdo de `supabase.schema.sql`.
5. Copie:
   - `Project URL`
   - `anon public key`

### 2. Configurar variaveis do app

Crie um arquivo `.env` com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

No deploy da Vercel, configure essas mesmas variaveis em:

`Project Settings > Environment Variables`

### 3. Publicar na Vercel

1. Suba este projeto para um repositorio GitHub.
2. Acesse `https://vercel.com`.
3. Clique em `Add New Project`.
4. Importe o repositorio.
5. Configure:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
6. Adicione as variaveis do Supabase.
7. Clique em `Deploy`.

Ao final, a Vercel gera um link como:

```text
https://revenue-forecast-crm.vercel.app
```

Esse link pode ser compartilhado com gestor e vendedores.

## Observacao sobre seguranca

O schema atual esta preparado para uso com usuarios autenticados no Supabase.
Para colaboracao real em producao, o proximo passo ideal e adicionar login.

Fluxo sugerido:

- gestor acessa tudo;
- vendedor acessa suas proprias oportunidades;
- todos editam em tempo real no mesmo banco;
- exportacao CSV continua disponivel para Google Sheets.

## Alternativa rapida, menos segura

E possivel liberar leitura/escrita anonima no Supabase para um piloto interno, mas isso nao e recomendado para dados comerciais reais.

## Proximas evolucoes

- Login por email.
- Permissao por perfil: gestor, vendedor, SDR.
- Historico de movimentacoes por card.
- Comentarios por oportunidade.
- Exportacao automatica para Google Sheets.
- Relatorios executivos por vendedor.
- IA para prever risco de perda e probabilidade de fechamento.
