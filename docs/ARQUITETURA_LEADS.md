# Arquitetura sugerida para o formulário de leads

Hoje (`src/lib/leads.js`) o formulário grava o lead **apenas no localStorage do navegador da pessoa** — nada sai da máquina dela. Isso deixa a aplicação 100% estática (pode ser hospedada de graça em Vercel/Netlify/GitHub Pages) enquanto você decide onde os leads vão morar de verdade. Quando decidir, o único arquivo que precisa mudar é `src/lib/leads.js`; o formulário (`src/components/LeadGate.jsx`) não muda.

Regra de ouro: **nenhuma chave de API ou segredo pode ficar no código do frontend**, porque ele roda no navegador de qualquer visitante. Qualquer serviço que exija uma chave secreta (Supabase com service role, um CRM, etc.) precisa de uma função intermediária rodando no servidor.

## Opção 1 — Google Sheets (mais simples, sem custo)

1. Crie uma planilha no Google Sheets com as colunas `nome`, `email`, `whatsapp`, `consentimento`, `criado_em`.
2. Nela, vá em **Extensões → Apps Script** e cole um script que recebe um POST e usa `SpreadsheetApp` para adicionar uma linha (`doPost(e)`).
3. Publique o Apps Script como **Aplicativo da Web** (acesso: qualquer pessoa) — isso gera uma URL pública.
4. Em `src/lib/leads.js`, descomente o bloco `fetch(...)` e aponte para essa URL.

Prós: gratuito, não exige backend próprio, dá para consultar/filtrar direto na planilha.
Contras: não é adequado para grandes volumes nem para automações mais sofisticadas.

## Opção 2 — Supabase (Postgres gerenciado)

1. Crie um projeto no Supabase e uma tabela `leads` (`nome`, `email`, `whatsapp`, `consentimento`, `criado_em`).
2. Ative **Row Level Security** com uma política que só permite `INSERT` (nunca `SELECT`) usando a `anon key` pública — assim o frontend só consegue *criar* um lead, nunca ler a lista de outras pessoas.
3. Em `src/lib/leads.js`, use o `@supabase/supabase-js` com a URL do projeto e a `anon key` (ela é pública por design, mas a política de RLS é o que garante a segurança).

Prós: banco relacional de verdade, dashboard pronto, fácil de escalar para outras tabelas do negócio (ex.: candidatos, agendamentos).

## Opção 3 — Firebase (Firestore)

Mesma lógica do Supabase: coleção `leads`, regras do Firestore liberando apenas `create`, chave pública do Firebase no frontend. Boa opção se o restante do ecossistema (auth, hospedagem) já for Firebase.

## Opção 4 — Webhook de CRM (RD Station, HubSpot, ActiveCampaign, etc.)

A maioria dos CRMs de marketing tem um endpoint de "captura de lead" que aceita POST com nome/e-mail/telefone e já dispara automações (e-mail de boas-vindas, tags, etc.). Nesse caso:

- Se o CRM expõe um endpoint público pensado para formulários de site (sem exigir chave secreta), pode-se chamar direto do frontend.
- Se exigir uma chave de API secreta, use uma função serverless (Vercel/Netlify Function, Cloudflare Worker) como intermediária: o frontend chama a função, e só a função (rodando no servidor) conhece a chave secreta.

## Recomendação

Para começar, **Google Sheets** é o caminho mais rápido para validar o funil sem nenhuma infraestrutura nova. Se o volume de leads crescer ou for necessário disparar automações (WhatsApp, e-mail em sequência, segmentação por especialidade de interesse), migrar para Supabase + uma ferramenta de automação (Zapier/Make ligando o Supabase ao WhatsApp/CRM) é o próximo passo natural.
