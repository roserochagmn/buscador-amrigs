# Buscador de Vagas de Residência Médica

Ferramenta web para consulta e filtragem de vagas de Residência Médica — **Especialidades com Acesso Direto, Vagas em Primeira Oportunidade** (Anexo VI do edital). Construída com **React + Vite + Tailwind CSS**, 100% frontend estático (sem backend obrigatório), com captura de leads antes da liberação do acesso.

- 📄 Fonte única dos dados: `data/vagas.json` (408 registros extraídos do Anexo VI do edital, ver `docs/RELATORIO_VALIDACAO.md`).
- 🔍 Busca com filtros combináveis (especialidade, estado, cidade, instituição, faixas numéricas, pesos das notas, programa governo).
- 📊 Ordenação, comparação lado a lado e detalhe por instituição com referência de página do edital.
- 📝 Página de captura de leads (nome, e-mail, WhatsApp + consentimento) antes de liberar o buscador.
- 📈 Eventos de analytics já instrumentados (`src/lib/analytics.js`), prontos para Google Analytics/GTM.

## Estrutura do projeto

```
├── data/                    # Base de dados (separada da interface)
│   ├── vagas.json           # Base final usada pela aplicação
│   ├── vagas.csv            # Mesma base em CSV, para abrir em planilha
│   └── vagas_raw_extraido.json  # Saída bruta da extração (antes da tipagem final) — útil para auditoria
├── src/
│   ├── components/          # FilterPanel, ResultsTable, DetailModal, CompareBar, CompareModal, LeadGate
│   ├── pages/                # Buscador.jsx (tela principal após liberar o acesso)
│   ├── lib/                  # filters.js, format.js, analytics.js, leads.js
│   ├── styles/                # index.css (tokens de cor/tipografia + Tailwind)
│   ├── App.jsx                # Alterna entre a página de captura e o buscador
│   └── main.jsx
├── scripts/
│   ├── extract_from_pdf.py   # Extrai data/vagas.json a partir do PDF do edital
│   └── validate-data.mjs     # Validação de consistência de data/vagas.json
├── docs/
│   ├── RELATORIO_VALIDACAO.md
│   └── ARQUITETURA_LEADS.md
├── public/
├── index.html
└── package.json
```

## Como instalar

Pré-requisitos: [Node.js](https://nodejs.org/) 18 ou mais recente.

```bash
npm install
```

## Como executar localmente

```bash
npm run dev
```

Abra o endereço mostrado no terminal (normalmente `http://localhost:5173`). Qualquer alteração em `src/` recarrega a página automaticamente.

Para gerar a versão de produção (arquivos estáticos otimizados) e pré-visualizá-la:

```bash
npm run build
npm run preview
```

## Como atualizar a base de dados

A base fica inteiramente separada da interface em `data/vagas.json` — atualizar os dados **não exige reconstruir a aplicação**, só substituir esse arquivo (a interface lê o JSON diretamente).

### Opção A — reextrair de um novo PDF do edital

```bash
pip install pdfplumber
python3 scripts/extract_from_pdf.py caminho/para/o/edital.pdf --last-page 53
```

- `--last-page` é a última página (1-indexada) que ainda pertence ao Anexo VI (Acesso Direto) no PDF que você está processando — confira isso antes de rodar, porque cada edital pode ter uma paginação diferente. O script avisa no terminal se encontrar o cabeçalho "Anexo VII" antes do fim do intervalo informado.
- Ao final, o script imprime quantos registros foram extraídos e lista qualquer linha que não conseguiu classificar ou registro incompleto — uma extração limpa não deve ter nenhum dos dois. Revise manualmente contra o PDF antes de publicar caso apareçam.
- Isso regrava `data/vagas.json`, `data/vagas.csv` e `data/vagas_raw_extraido.json`.

Depois de reextrair, rode a validação:

```bash
npm run validate-data
```

### Opção B — editar manualmente

`data/vagas.json` é uma lista de objetos com estas chaves (todas as strings preservam exatamente o texto do edital; campos numéricos ausentes no edital viram `null` e o texto original fica em `..._display`):

```json
{
  "id": 1,
  "especialidade": "Anestesiologia",
  "especialidade_num_edital": 1,
  "estado": "RS",
  "estado_nome": "Rio Grande do Sul",
  "entidade": "AMRIGS",
  "cidade": "Caxias do Sul",
  "instituicao": "Hospital Virvi Ramos",
  "numero_total_vagas": 1,
  "numero_vagas_militares": 0,
  "numero_vagas_livres": 1,
  "valor_instituicao": 500.0,
  "valor_instituicao_display": "500,00",
  "nota_minima": 50.0,
  "nota_minima_display": "50.00",
  "pesos_notas_finais": "Primeira Etapa 90% (TO) Segunda Etapa 10% (Currículo 60% e Arguição 40%)",
  "programa_governo": "Não informado",
  "pagina_origem_pdf": 1
}
```

Edite `data/vagas.csv` numa planilha se preferir, depois gere o JSON de volta (um script simples de CSV→JSON, ou peça para o Claude fazer a conversão). Sempre rode `npm run validate-data` depois de qualquer edição manual.

## Como alterar textos e identidade visual

- **Textos da página de captura e do buscador**: `src/components/LeadGate.jsx` (título, subtítulo, texto do botão) e `src/pages/Buscador.jsx` (título/subtítulo do topo).
- **Cores e tipografia**: tokens centralizados em `src/styles/index.css` (variáveis `--bg`, `--accent`, `--ink`, etc.) e fontes carregadas em `index.html` (Fraunces para títulos, IBM Plex Sans para o corpo, IBM Plex Mono para rótulos/dados). Trocar a paleta é editar essas variáveis; o tema escuro é gerado automaticamente a partir dos mesmos tokens.
- **Nome/marca**: `index.html` (`<title>`), `LeadGate.jsx` (eyebrow "ResidenteOn · Anexo VI do Edital").

## Como publicar no GitHub

```bash
cd buscador-residencia-medica   # pasta deste projeto
git init
git add .
git commit -m "Primeira versão do Buscador de Vagas de Residência Médica"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/buscador-residencia-medica.git
git push -u origin main
```

> `data/vagas.json` e `data/vagas.csv` **não contêm dados pessoais** — só as informações públicas do edital — então podem ficar no repositório público sem problema. Os leads capturados pelo formulário **não** vão para o repositório: eles ficam só no navegador de quem preenche (ou no destino que você configurar — veja `docs/ARQUITETURA_LEADS.md`).

## Como colocar a ferramenta online

O projeto é 100% estático depois do `npm run build` (gera a pasta `dist/`), então qualquer hospedagem de sites estáticos serve, gratuitamente:

**Vercel** (mais simples para projetos Vite)
1. Crie uma conta em vercel.com e conecte o repositório do GitHub.
2. Vercel detecta Vite automaticamente (build command `npm run build`, output `dist`). Clique em Deploy.

**Netlify**
1. Conecte o repositório em app.netlify.com.
2. Build command: `npm run build`. Publish directory: `dist`.

**GitHub Pages**
1. Rode `npm run build`.
2. Publique o conteúdo de `dist/` na branch `gh-pages` (pode usar a extensão `gh-pages` do npm ou o GitHub Actions).
3. Como o `vite.config.js` já usa `base: './'`, os caminhos funcionam em qualquer subpasta.

## Analytics

`src/lib/analytics.js` já dispara os eventos abaixo em `window.dataLayer` (padrão GA4/GTM):

| Evento | Quando dispara |
|---|---|
| `page_view` | Ao carregar a aplicação |
| `form_submit` | Ao enviar o formulário de leads |
| `tool_access` | Ao liberar o buscador após o formulário |
| `filter_applied` | A cada alteração de filtro |
| `institution_click` | Ao abrir o detalhe de uma instituição |
| `comparison_view` | Ao abrir a tela de comparação |

Para ativar o Google Analytics (GA4) ou o Google Tag Manager de verdade, cole o script de carregamento deles em `index.html` (há um exemplo comentado lá) — nenhum outro código precisa mudar.

## Arquitetura de leads

Ver `docs/ARQUITETURA_LEADS.md` para as opções de conectar o formulário a Google Sheets, Supabase, Firebase ou um CRM.

## Relatório de validação dos dados

Ver `docs/RELATORIO_VALIDACAO.md` para o detalhamento de como os dados foram extraídos e conferidos, o que foi encontrado e o que **não** foi inferido.
