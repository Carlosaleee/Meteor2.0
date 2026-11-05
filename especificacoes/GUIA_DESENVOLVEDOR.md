# Guia do Desenvolvedor — Meteor 2.0

> **Ultima atualizacao:** 04/11/2026 (branch `feature/noticias-esporte-limpeza`: noticias do Philippines Pro, secao "Esporte", grid de rodovias 5 colunas, trust proxy, docs parity `pnpm docs:check`, workflow refresh-cron — 286 testes; checklist pre-merge `pnpm verify`)
>
> **Documentos relacionados:** [SYSTEM_SPEC.md](./SYSTEM_SPEC.md) · [REFERENCIA_API.md](./REFERENCIA_API.md) · [../README.md](../README.md) · [../DESIGN.md](../DESIGN.md)

## Pre-requisitos

- Node.js 24+ (CI e dev local — Nest 12 é ESM-only e o Jest 30 exige Node 24.9+ para `require(esm)`; a CI usa `NODE_OPTIONS=--experimental-vm-modules`)
- pnpm 11+
- Git

## Setup Inicial

```bash
# Clonar o repositorio
git clone https://github.com/Carlosaleee/Meteor2.0.git
cd Meteor2.0

# Instalar dependencias
pnpm install

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas chaves (opcional para dados basicos)

# Criar .env.local no frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > apps/frontend/.env.local
```

## Como Rodar

### Backend (Terminal 1)
```bash
pnpm --filter backend dev
# Acessa em http://localhost:3001
# Health check: http://localhost:3001/health
```

### Frontend (Terminal 2)
```bash
pnpm --filter frontend dev
# Acessa em http://localhost:3000
```

## Comandos Uteis

```bash
# Build completo (todos os apps)
pnpm build

# Lint (todos os apps)
pnpm lint

# Testes (todos os apps)
pnpm test

# Regenerar o indice RAG de docs (requer GEMINI_API_KEY; reusa embeddings ja existentes no arquivo)
pnpm --filter backend rag:index

# Formatacao
pnpm format
```

## Testes

**Total: 286 testes — backend Jest (217) + frontend Vitest (69)**

> Contagem atualizada apos execucao completa em 04/11/2026 (28 arquivos backend + 13 frontend, todos verdes).

```bash
# Backend (217 testes — o script ja embute --experimental-vm-modules)
pnpm --filter backend test

# Frontend (69 testes — Vitest + React Testing Library)
pnpm --filter frontend test

# Paridade docs x controllers (Backlog P2 #2)
pnpm docs:check
```

| Suite | Runner | Testes | Observacao |
|-------|--------|--------|------------|
| `apps/backend` | Jest 30.5 (`node --experimental-vm-modules`) | 217 | 28 arquivos `*.spec.ts` |
| `apps/frontend` | Vitest + RTL + jsdom | 69 | 13 arquivos `*.test.{ts,tsx}` |

Detalhamento por arquivo: [SYSTEM_SPEC.md §9](./SYSTEM_SPEC.md#9-cobertura-de-testes).

### Checklist pre-merge (obrigatorio)

O **type-check so roda no `next build`** — `vitest` (runtime) e `oxlint` (sem type-aware) nao pegam erros de tipo. Em 30/10/2026 isso quebrou 7 deploys de producao seguidos (erro de tipo invisivel aos testes e ao lint). Antes de merge na `main`:

```bash
pnpm verify   # lint + test + build — espelho local da CI
```

Minimo aceitavel se o tempo apertar: `pnpm --filter frontend build` (exit 0) + `pnpm lint`. Alternativa: empurrar a branch `feature/*` **antes** do merge — a CI (`ci.yml`) roda em `push` para `feature/*` e falha antes de chegar na `main`.

### Identidade git (obrigatorio antes do push)

O Vercel **bloqueia o deploy de producao** quando o e-mail do commit nao pode ser associado a uma conta GitHub. Em 30/10/2026 isso bloqueou **9 deploys seguidos** do backend: `user.name`/`user.email` estavam com aspas curvas (`“Carlos` / `“alexandregularte013@gmail.com”`) — e-mail invalido, impossivel de associar. A producao do backend ficou **presa em 21/10 por 13 dias**, sem as Fases 1-6, mesmo com a CI verde.

```bash
git var GIT_AUTHOR_IDENT   # deve imprimir: Carlos Alexandre <86754119+Carlosaleee@users.noreply.github.com>
```

Use o **noreply da conta** (`<id>+<login>@users.noreply.github.com`): a associacao e intrinseca (o id 86754119 e o proprio `Carlosaleee`) e nao depende de e-mail verificado. Desconfie de aspas tipograficas — o PowerShell as introduz ao colar texto formatado.

## Rate Limit (Seguranca)

- `@nestjs/throttler` **60 req/min** por IP (`TTL` 60s)
- **Throttle dedicado:** `POST /v1/iron/chat` tem **5 req/min** por IP (`@Throttle({ default: { limit: 5, ttl: 60_000 } })` — cada mensagem custa 1 chamada Gemini)
- **Loopback isento:** `127.0.0.1`/`::1` nao contam (testes e dev locais nao sao bloqueados)
- Respostas incluem headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Ao exceder: HTTP **429** com header `Retry-After`

## Estrutura do Projeto

```
Meteor_2.0/
  apps/
    backend/           # API NestJS
      src/
        common/        # Servicos compartilhados (ai, async, fallback, http, config, refresh, time)
        modules/       # Modulos de dominio (meteorology, oceanography, traffic, noticias-regionais, comercio, iron + iron/rag, news)
      data/            # JSONs de fallback + rag-index-docs.json (versionado)
      scripts/         # rag-index.mjs (regenera indice RAG de docs)
    frontend/          # App Next.js
      src/
        app/           # Paginas (7 rotas)
          meteorologia/
            page.tsx   # PageBanner + cards temperatura + Tabs
            components/ # 13 componentes
          swell/           # 5 abas + 21 componentes
            page.tsx
            components/
          noticias/        # Noticias regionais + TrafficMap + CityGrid
            page.tsx
            components/    # TrafficMap
          comercio/        # Comercio de Ilha Comprida + CommerceMap
            page.tsx
            CommerceMap.tsx
          blog/
          creditos/
        components/    # Componentes reutilizaveis
          Header.tsx   # Nav responsiva (7 itens) + toggle idioma pt/es
          Footer.tsx   # 4 colunas (Navegacao, Fontes, Stack, Links uteis)
          PageBanner.tsx # Hero reutilizavel (banner-meteor.jpg)
          ChatWidget.tsx # Chat Iron: desempacota envelope, sanitiza historico, trata 429, botoes Reiniciar/Apagar, aria-live, sessionId + historico (ate 10 turnos)
        hooks/         # Hooks customizados (9 hooks + 5 testes)
        lib/           # Utilitarios (api.ts, spots-data.ts)
  especificacoes/      # Documentacao do projeto
  DESIGN.md            # Design system tokens
```

## Padroes de Codigo

### Componentes (Frontend)
- Arquivos em `src/app/` sao paginas (rotas)
- Componentes reutilizaveis em `src/components/`
- Hooks customizados em `src/hooks/`
- Utilitarios em `src/lib/`

### Backend
- Padrao 3 camadas: Controller > Service > Repository
- Controllers: rotas HTTP
- Services: logica de negocio
- Repositories: acesso a dados (APIs externas + fallback)
- FallbackService: compartilhado via modulo global
- **RefreshService:** automacao de refresh (cron 6h pesado + cron 1h rankings/noticias; startup e `@Cron` pulados em `process.env.VERCEL` — os crons reais vem do `vercel.json`)
- **GeminiClientService (`common/ai/`):** cliente unico de Gemini — texto via SDK `@google/genai` com timeout de 45s por chamada, embeddings via REST direto (15s); usado por oceanografia, chat Iron e RAG
- **RagModule (`modules/iron/rag/`):** retrieval hibrido (embedding Gemini 60% + BM25 40%, topK=3, cache LRU de consultas com TTL 5 min); indice de docs versionado (`data/rag-index-docs.json`, regenerar com `pnpm --filter backend rag:index`) + indice de dados reconstruido no refresh
- **Single-flight (`common/async/`):** deduplica chamadas concorrentes (resumo IA, noticias, rebuild do indice RAG)

### Estilizacao
- Tailwind CSS v4 (sem tailwind.config.js)
- Design tokens em `globals.css` via `@theme` + `[data-theme="light"]`
- CSS custom properties para Header, Footer, Nav (dark + light)
- Padrao visual: slate-900, rounded-2xl, border-slate-800
- Icones: React Icons (Font Awesome) — `react-icons/fa`
- Tema: dark/light com `localStorage` + `prefers-color-scheme`
- Linha dourada: `var(--color-gold-line)` #E0B429 (dark) / #C49A1A (light)

## Vercel MCP (Integracao com IA)

### Configuracao
O Vercel MCP permite que ferramentas de IA acessem dados do Vercel (deploys, logs, projetos).

Arquivo de configuracao: `~/.config/opencode/opencode.jsonc`

```json
{
  "mcpServers": {
    "vercel": {
      "url": "https://mcp.vercel.com"
    }
  }
}
```

### Uso
1. Reinicie o opencode apos configurar
2. Na primeira uso, autentique via OAuth (link aparece no terminal)
3. Pode perguntar sobre deploys, logs, projetos do Vercel

### Exemplos de comandos
- "Quais sao os ultimos deploys do projeto?"
- "Mostre os logs do deploy que falhou"
- "Quais projetos tenho no Vercel?"

### Nota de decisao — MCP do Google
**MCP do Google NAO sera adotado em runtime** — o caminho oficial e o SDK `@google/genai` (+ REST direto para embeddings RAG, via `GeminiClientService` em `common/ai/`). Reavaliar apenas se o projeto migrar para GCP/Firebase/Workspace.

---

## Convencoes de Commit

Padrao Conventional Commits:
```
tipo(escopo): descricao curta

Exemplos:
feat(meteorologia): redesign completo — 4 abas, radar real
fix(footer): alinhamento 4 colunas — Navegacao, Fontes, Stack, Chatbot
feat(swell): estilizacao da tela de ondas
```

Tipos: feat, fix, docs, style, refactor, test, chore, ci

## Fluxo de Trabalho

1. Criar branch a partir da `main`:
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. Implementar e commitar:
   ```bash
   git add .
   git commit -m "feat(novo): descricao"
   ```

3. Push para o remoto:
   ```bash
   git push origin feature/nome-da-feature
   ```

4. Criar Pull Request para `main`

5. Apos aprovacao, merge na `main`

**NUNCA** commitar direto na `main`.

## Variaveis de Ambiente

Schema validado por Zod em `apps/backend/src/common/config/env.schema.ts`.

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Porta do backend | `3001` |
| `FRONTEND_ORIGIN` | CORS origin permitido | `http://localhost:3000` |
| `FALLBACK_DIR` | Diretorio dos JSONs de fallback — na **Vercel (producao)**: `apps/backend/data` (cwd do lambda e a raiz do repo; em runtime a escrita vai para `/tmp`) | `data` (local) / `apps/backend/data` (Vercel) |
| `FALLBACK_MAX_AGE_HOURS` | Idade maxima aceita do fallback | `24` |
| `OPEN_METEO_MODELS` | Modelo meteorologico pedido ao Open-Meteo (query `models=`; ecoado em `meta.model`) | `best_match` |
| `NODE_ENV` | Modo da aplicacao (`development`/`test`/`production`) | `development` |
| `GEMINI_API_KEY` | Chave Gemini (resumo IA, chat Iron, embeddings RAG) — formato novo `AQ...` desde Set/2026 (antigo `AIzaSy...` descontinuado); obter em https://aistudio.google.com/apikey | *(vazio)* |
| `GEMINI_MODEL` | Modelo Gemini (texto) | `gemini-flash-latest` |
| `GEMINI_EMBEDDING_MODEL` | Modelo de embeddings do RAG | `gemini-embedding-2` |
| `GEMINI_EMBEDDING_DIMS` | Dimensao dos vetores do RAG | `128` |
| `GEMINI_TEMPERATURE` | Temperatura de amostragem | `0.7` |
| `GEMINI_API_BASE_URL` | Base do REST direto de embeddings (o `generateText` do SDK usa a URL padrao do SDK) | `https://generativelanguage.googleapis.com/v1beta/models` |
| `STORMGLASS_API_KEY` | Reservada (oceanografia avancada) | *(vazio)* |
| `INMET_API_TOKEN` | Reservada (estacoes INMET) | *(vazio)* |
| `INMET_BASE_URL` | Declarada no schema (repositorio usa URL direta) | `apitempo.inmet.gov.br` |
| `GITHUB_TOKEN` | Consumida apenas pelo MCP local (`.opencode/mcp/github-server.mjs`) | *(vazio)* |
| `ARTESP_API_KEY` | **Opcional** — API oficial CCM/ARTESP de ocorrencias rodoviarias (header `Authorization: Api-Key ...`, ate 12 req/h; cache 10min). Sem chave, as rotas SP-222/SP-165/SP-055 usam o **painel Waze publico** (`https://ccm.artesp.sp.gov.br/rodovias/waze`) — solicitar em https://ccm.artesp.sp.gov.br/rodovias/api/docs/ | *(vazio)* |
| `CRON_SECRET` | Auth de `GET/POST /v1/cron/refresh` — lida via `process.env` cru, fora do schema Zod; **sem default e obrigatoria** (ausente ou errada → 401; setar no dashboard da Vercel em producao) | *(nenhuma)* |
| `NODE_OPTIONS` | **Vercel (producao):** `--experimental-require-module` — habilita `require()` de deps ESM-only (Nest 12); a Vercel desativa por padrao via `--no-experimental-require-module` | *(na Vercel)* `--experimental-require-module` |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL da API backend (bundled no JS). **Produção:** usa `/api` (proxy) e **descarta valores localhost** (`API_BASE` em `lib/api.ts` ignora `localhost`/`127.0.0.1` quando `NODE_ENV=production`) | dev: `http://localhost:3001` · prod: `/api` |

### Logs e Depuracao (Backend)
- Logs aparecem no terminal do `pnpm --filter backend dev`
- Erros retornam no formato ApiEnvelope: `{ success, data, error }`
- Health check: `GET /health` (ou `GET /` — rota raiz responde o mesmo)

### Logs e Depuracao (Frontend)
- Erros de compilacao aparecem no browser
- Dados da API: abrir Network tab > `/v1/meteorology`
- Mapas: verificar console por erros Leaflet

## Troubleshooting

### Erro "Map container is already initialized"
- Reiniciar o dev server
- O projeto usa cleanup via `map.remove()` no useEffect

### Erro "NEXT_PUBLIC_API_URL is not defined"
- Verificar se `apps/frontend/.env.local` existe
- Conteudo: `NEXT_PUBLIC_API_URL=http://localhost:3001`

### Frontend não carrega dados na Vercel (chamadas para localhost)
**Causa clássica (out/2026):** env var `NEXT_PUBLIC_API_URL=http://localhost:3001` no **dashboard da Vercel** (projeto frontend) — variáveis de dashboard têm precedência sobre `.env.production` do repo e embutem `localhost` no bundle, fazendo o browser chamar a máquina do visitante (`ERR_CONNECTION_REFUSED`).
- **Diagnóstico:** `curl https://meteor2-0-frontend.vercel.app/api/health` (proxy OK?) + buscar `localhost:3001` nos chunks JS servidos em `/_next/static/chunks/`
- **Correção:** apagar/corrigir a env var no dashboard (usar `/api`) e Redeploy — `NEXT_PUBLIC_*` só é reembutida em novo build
- **Blindagem no código:** `API_BASE` (`apps/frontend/src/lib/api.ts`) descarta valores `localhost`/`127.0.0.1` em produção e usa `/api` automaticamente
- Nunca commitar `.env.local` (gitignoreado); `.env.production` versionado traz `NEXT_PUBLIC_API_URL=/api`

### Fallbacks sempre retornando dados antigos
- Verificar se `apps/backend/data/` existe
- Os JSONs sao criados automaticamente na primeira requisicao bem-sucedida

### Status das rodovias marcado como "estimado" (nunca vira ao vivo)
**Causa:** o `ArtspWazeRepository` nao conseguiu ler o painel Waze da ARTESP (`https://ccm.artesp.sp.gov.br/rodovias/waze`) nem a API de ocorrencias.

**Parser multi-estrategia (04/11, Backlog P2 #4):** o parser nao depende mais so do seletor `#text__tempo-viagem` — tenta (1) o bloco original, (2) ancora `*SP 222*: <atraso> | <extensao>` em TODO o HTML, (3) os cards `data-trafego-card` sozinhos. Alem disso, um **snapshot em disco** (`artsp-live-routes.json` no tmpdir, TTL 30min; dir sobrescrevivel via `ARTSP_SNAPSHOT_DIR`) mantem `live` numa falha transitoria em vez de rebaixar para `estimated`.

**Verificacoes:**
1. `curl -s https://ccm.artesp.sp.gov.br/rodovias/waze | findstr "Coletado em"` — as entradas `*SP 222*:` precisam existir em algum lugar do HTML (se a ARTESP mudar o formato das entradas, ajustar `parseLooseEntries`/`parseSummaryEntries` no `artsp-waze.repository.ts`)
2. Logs do backend: procurar `Falha ao obter painel Waze da ARTESP` (e `usando snapshot em disco` — sinal de que o snapshot esta compensando)
3. Se o snapshot expirar (>30min sem sucesso) e as fontes continuarem caidas, o sistema cai legitimamente para `estimated` — investigar a ARTESP
4. Com `ARTESP_API_KEY` setada, erros `API CCM/ARTESP retornou 403/429` indicam chave invalida ou rate limit (12 req/h) — o cache de 10min do repositorio ja respeita o limite; um `POST /v1/cron/refresh` zera os caches
5. Rotas **BR-116 (federal/DNIT) e balsa Cananeia-Ilha Comprida ficam `estimated` por design** — nao ha fonte publica de status para elas; so SP-222/SP-165/SP-055 recebem dado ao vivo

### Erro "ReferenceError: window is not defined" no build
**Causa:** Componente Leaflet importado diretamente sem protecao SSR.

**Correcao:** Usar `next/dynamic` com `{ ssr: false }`:

```tsx
// INCORRETO
import { CommerceMap } from './CommerceMap';

// CORRETO
import dynamic from 'next/dynamic';
const CommerceMap = dynamic(() => import('./CommerceMap').then(mod => mod.CommerceMap), { ssr: false });
```

**Componentes que precisam dessa protecao:**
- Qualquer componente que importa `leaflet` ou `leaflet/dist/leaflet.css`
- Qualquer componente que usa `window`, `document`, `navigator` diretamente
- Graficos ApexCharts (react-apexcharts)

### Erro "Must use import to load ES Module" no Jest (backend)
**Causa:** NestJS 12 publica pacotes ESM-only; o Jest (CJS) precisa da flag `--experimental-vm-modules`.

**Correcao:** Rodar os testes via `pnpm --filter backend test` (o script ja embute `node --experimental-vm-modules`). A CI usa o mesmo setup em Node 24 (`NODE_OPTIONS="--experimental-vm-modules" npx jest`).

### RefreshService nao atualiza dados
**Causa:** Endpoint de refresh nao configurado ou CRON_SECRET incorreto.

**Verificacoes:**
1. Verificar se `@nestjs/schedule` esta instalado: `npm ls @nestjs/schedule`
2. Verificar se `ScheduleModule.forRoot()` esta no `app.module.ts`
3. Verificar se `RefreshModule` esta no `app.module.ts`
4. Testar manualmente: `curl -X POST http://localhost:3001/v1/cron/refresh -H "x-cron-secret: SEU_CRON_SECRET"` (ou `-H "Authorization: Bearer SEU_CRON_SECRET"`; no GET aceita tambem `?secret=SEU_CRON_SECRET`)
5. Sem `CRON_SECRET` no `.env` (ou com valor errado) o endpoint responde **401 Unauthorized** — nao existe mais default
6. Verificar status: `curl http://localhost:3001/v1/cron/status`

### Erro "Unable to find element with text" nos testes
**Causa:** Componente usa Context (ex: `useChat()`) mas o teste nao fornece o Provider.

**Correcao:** Envolver o componente no Provider durante o teste:

```tsx
import { ChatProvider } from './ChatContext';

render(
  <ChatProvider>
    <ChatWidget />
  </ChatProvider>
);
```

## Padroes de UI

### Componentes React (Icones)
- Icones: React Icons (Font Awesome) — `react-icons/fa`
- Exemplo: `import { FaHome, FaCloudSun } from 'react-icons/fa'`

### Header
- Logo: "Meteor" com icone `FaWater`
- Linha dourada: `<div className="h-1 w-full bg-[var(--color-gold-line)]" />`
- Toggle tema: `FaSun`/`FaMoon`

### Nav Bar (Responsiva)
- Desktop: `hidden md:flex` — horizontal centrado (7 itens)
- Mobile: Hamburger (`FaBars`/`FaTimes`) com dropdown
- **Ordem:** Principal > Previsão do Tempo > Swell > Noticias > Comercio > Blog > Creditos
- Hover dourado: `hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)]`
- Pagina ativa: `border-b-2 border-[var(--color-gold)]` (desktop) / `border-l-2` (mobile)
- Auto-close: `useEffect(() => setMenuOpen(false), [pathname])`

### Footer (4 Colunas — Layout Atualizado)
- **Linha 1:** "METEOR 2.0" centralizado em dourado + descricao
- **Coluna 1:** Navegacao (6 links internos: Previsao, Swell, Noticias, Comercio, Blog, Creditos)
- **Coluna 2:** Fontes de Dados (5 links externos: Open-Meteo, INMET, RainViewer, CPTEC, OSM)
- **Coluna 3:** Stack Tecnologica (5 links externos: Next.js 15, NestJS, Tailwind, Leaflet, TypeScript)
- **Coluna 4:** Links Uteis — contatos de emergencia `tel:` (190, 193, 192, 199, 197, Hospital)
- **Rodape:** ano atual + "Meteor — Creditos de Desenvolvimento: Carlos Alexandre"
- Linha dourada no topo

### PageBanner (Hero Reutilizavel)
- Componente: `components/PageBanner.tsx`
- Uso: `<PageBanner title="Titulo" subtitle="Subtitulo" />`
- Imagem: `banner-meteor.jpg` com gradient dourado
- Altura: 160px
- Usado em: `/meteorologia`, `/noticias`, `/comercio`, `/swell`

### Acessibilidade
- Skip-link: `<a href="#main-content" className="skip-link sr-only">`
- `role="banner"` (header), `role="navigation"` (nav), `role="contentinfo"` (footer)
- `role="menubar"` / `role="menuitem"` nos links
- `aria-current="page"` na pagina ativa
- `aria-expanded` / `aria-controls` no hamburger
- `aria-pressed` nos botoes de toggle
- `aria-hidden="true"` em icones decorativos
- `focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]` em todos os interativos
- **Title tooltips em todos os elementos interativos**
- `aria-live="polite"` para atualizacoes de dados
- `role="radiogroup"` em seletores de cidade
- `role="tablist/tab/tabpanel"` em abas

### Tema Dark/Light
- CSS variables em `globals.css`: `@theme` (dark) + `[data-theme="light"]` (light)
- Persistencia: `localStorage.setItem('meteor-theme', theme)`
- Deteccao: `window.matchMedia('(prefers-color-scheme: light)')`
- Aplicacao: `document.documentElement.setAttribute('data-theme', 'light')`
- Componentes usam `var(--color-*)` em vez de hardcoded

---

## Capa — Portal Principal `/` (Guia Completo)

### Ordem das secoes (uma por aba do portal)
1. **Hero Carousel** — slide 1 = Notícias do Vale; ordem: Notícias → Previsão → Swell → Comércio → Blog
2. **Previsão do Tempo** (`#tempo`) — 4 cidades, atual + máx/mín de hoje → CTA `/meteorologia`
3. **Últimas Notícias Regionais** (`#noticias`) — filtros `aria-pressed` → CTA `/noticias`
4. **Condições do Mar** (`#mar`) → CTA `/swell?tab=overview`
5. **Briefing Executivo (IA)** (`#briefing`) → CTA `/swell?tab=forecast`
6. **Status das Rodovias** (`#rodovias`) → CTA `/noticias#rodovias`
7. **Comércio em Destaque** (`#comercio`) → CTA `/comercio`
8. **Esporte** (`#surf-news`) — 3 cards via `useNews` → CTA `/swell?tab=news`
9. **Blog & Navegação** (`#blog`) → CTA `/blog`

> A secao "Alerta Regional" foi removida (duplicava Status das Rodovias).

### Deep-link de aba no `/swell`
- `?tab=overview|news|forecast|wind|spots` lido no `useEffect` de `app/swell/page.tsx` (nao usa `useSearchParams` — nao quebra o prerender estatico)
- Tab invalida cai para `overview`; a query e limpa com `history.replaceState`

### Acessibilidade da capa
- `h1` sr-only + skip-link para `#conteudo` (o `main` global ja tem `#main-content`)
- `aria-busy` nas secoes com carregamento; `focus-within:ring` marca a secao focada
- Carrossel: botao **Pausar/Reproduzir** (`aria-pressed`), autoplay desligado com `prefers-reduced-motion`, setas ←/→ para navegar
- `globals.css`: `@media (prefers-reduced-motion: reduce)` neutraliza animacoes/transicoes

---

## Pagina de Previsão do Tempo (Guia Completo)

### Estrutura
```
meteorologia/
  page.tsx                    # Card container principal
  components/
    LocationSelector.tsx      # Selecao de cidade
    MeteorologyTabs.tsx       # 4 abas
    PrevisaoTab.tsx           # Conteudo da aba Previsao
    WeatherMapDetail.tsx      # Mapa Leaflet + RainViewer
    MetricCard.tsx            # Card de metrica
    HourlyTimeline.tsx        # Previsao horaria 24h
    DailyForecast.tsx         # Previsao diaria 7 dias
    CityGrid.tsx              # Noticias meteorologicas
    AvisosTab.tsx             # Alertas oficiais
    SatelliteTab.tsx          # Imagens de satelite
    NumericaTab.tsx           # Modelos numericos
    Skeletons.tsx             # Loading states
    weather-utils.ts          # Funcoes utilitarias
```

### Hero Layout
```tsx
<PageBanner title="Previsão do Tempo" subtitle="Previsao de tempo, satelite e modelos numericos" />
<div className="flex flex-wrap items-center justify-between gap-3">
  <div className="flex flex-wrap items-center gap-2">
    {/* Cards de temperatura por cidade */}
  </div>
  <button onClick={refetch}>Atualizar</button>
</div>
```

### Grid Responsivo (HourlyTimeline)
```tsx
gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))'
// Mobile: 4 colunas
// Tablet: 8 colunas
// Desktop: 12 colunas
```

### Tooltips (Padrao)
```tsx
<button
  title="Clique para ver previsao de Ilha Comprida — praia e litoral"
  aria-label="Ilha Comprida, Litoral Sul (selecionada)"
>
```

### Radar RainViewer
```tsx
fetch('https://api.rainviewer.com/public/weather-maps.json')
  .then(res => res.json())
  .then(data => {
    const latest = data.rain.past.slice(-1)[0];
    L.tileLayer(
      `https://tilecache.rainviewer.com${latest.path}/512/{z}/{x}/{y}/2/1_1.png`,
      { opacity: 0.5 }
    ).addTo(map);
  });
```

---

## Pagina de Swell (Guia Completo)

### Estrutura
```
swell/
  page.tsx                    # 5 abas (padrao: Visao Geral)
  components/
    SwellTabs.tsx             # Navegacao por abas com aria pattern
    OverviewTab.tsx           # Aba Visao Geral (orquestra os demais)
    ResumoIA.tsx              # Briefing Gemini com markdown (+ .test.tsx)
    ForecastSection.tsx       # Secao de previsao horaria
    WaveChart.tsx             # Grafico ApexCharts area (ondas)
    WindChart.tsx             # Grafico ApexCharts (vento)
    TideChart.tsx             # Grafico ApexCharts linha (mares)
    SpotGrid.tsx              # Cards de spots com filtros e busca
    SpotsMap.tsx              # Mapa Leaflet dos points
    SurfNews.tsx              # Noticias por categoria
    WslRankings.tsx           # Rankings WSL masc/fem
    UpcomingEvents.tsx        # Proximos eventos
    HourlySwell.tsx           # Grid responsivo 12h (ondas)
    HourlyWind.tsx            # Grid responsivo 12h (vento)
    ConditionCards.tsx        # 5 mini cards de condicoes
    WindConditionCards.tsx    # Mini cards de vento
    DailyTip.tsx              # Dica pratica do dia
    CommerceGrid.tsx          # Grid de comercio (compartilhado)
    Skeletons.tsx             # Loading states
    windUtils.ts              # Helpers de vento
```

### Hooks
| Hook | Arquivo | Descricao |
|------|---------|-----------|
| useSwell.ts | src/hooks/ | Busca GET /v1/oceanography |
| useHourlyMarine.ts | src/hooks/ | Busca GET /v1/oceanography/hourly |
| useAiSummary.ts | src/hooks/ | Busca GET /v1/oceanography/summary |
| useNews.ts | src/hooks/ | Busca GET /v1/news (refetch via `useCallback` estavel) |
| useWeatherNews.ts | src/hooks/ | Busca GET /v1/meteorology/news (auto-refresh 10min) |

### Ordem das Abas (padrao: Visao Geral)
```
[Visao Geral] [Noticias] [Previsao de Ondas] [Previsao de Ventos] [Points]
```

### Graficos ApexCharts

#### WaveChart (Ondas)
```tsx
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Serie: waveHeight (area azul) + swellHeight (area cyan)
// Altura: 350px
// Faixas de qualidade: tracejadas em 1.0m (Boas) e 1.5m (Classico)
```

#### TideChart (Mares)
```tsx
// Serie: waveHeight como proxy de mare
// Altura: 320px
// Annotations: alta (amber) e baixa (blue)
// Tabela de proximas 4 marees abaixo do grafico
```

### Padroes de UI (Swell)

#### Tab Navigation (SwellTabs)
```tsx
<div role="tablist" aria-label="Secoes de swell">
  <button role="tab" aria-selected={isActive} aria-controls={`panel-${id}`} tabIndex={isActive ? 0 : -1}>
```

#### ConditionCards
```tsx
// 5 mini cards: Onda, Swell, Periodo, Direcao, Qualidade
// Cada um com icone, valor grande, e label
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
```

#### ResumoIA (Markdown)
```tsx
// Renderiza **negrito** e listas com -
// Topic emojis: 🏄 Ondas, 🌬️ Vento, ⏰ Horarios, 🏆 Points, ⚠️ Alertas
function renderMarkdown(text: string): React.ReactNode[]
```

#### DailyTip
```tsx
// Dica baseada na altura da onda:
// <0.5m: flat, SUP
// 0.5-1.0m: iniciante, longboard
// 1.0-1.5m: intermediario, fish/hybrida
// 1.5-2.0m: experiente, shortboard
// >2.0m: avancado, gun
```

### Acessibilidade (Swell)
- `role="tablist/tab/tabpanel"` nas abas
- `aria-selected`, `aria-controls`, `tabIndex` roving
- `title` em todos os cards e botoes
- `aria-label` em todas as secoes
- `aria-live="polite"` para resumo IA
- `focus-visible:ring-2 focus-visible:ring-blue-400`
- Tooltips detalhados com todos os valores

### Gemini AI (Resumo)
- Backend: `gemini.repository.ts` usando o `GeminiClientService` unico (`common/ai/`) via `@google/genai`
- Prompt: briefing completo com 5 topicos (Ondas, Vento, Horarios, Points, Alertas)
- Max tokens: 2500
- Cache: 1h no backend (`summaryCache`) + single-flight (requisicoes simultaneas compartilham a mesma chamada)
- Fallback: resumo estatico baseado nos dados quando Gemini falha

> **[LLM_CONTEXT] Gemini API Key (Set/2026):** formato novo `AQ...` (obter em https://aistudio.google.com/apikey). O SDK `@google/genai` aceita ambos os formatos — a mudança é transparente para o código. Variável de ambiente: `GEMINI_API_KEY` no backend (.env).

---

## Pagina de Noticias (Guia Completo)

### Estrutura
```
noticias/
  page.tsx                    # PageBanner + TrafficMap + CityGrid + filtros + grid noticias
  components/
    TrafficMap.tsx             # Leaflet com rotas coloridas por condicao
```

### Secoes da Pagina
1. **PageBanner** — Foto de capa com titulo "Noticias do Vale do Ribeira"
2. **Status das Rodovias** — 4 cards (SP-222, SP-055, BR-116, Balsa) com condicao
3. **Mapa de Rodovias** — TrafficMap com Leaflet + OpenStreetMap
4. **CityGrid** — Noticias meteorologicas por cidade (reutilizado de meteorologia)
5. **Filtros** — Filtros por categoria (todas, transito, noticias, policial, turismo, cotidiano)
6. **Grid de Noticias** — Cards de noticias regionais com links externos

### TrafficMap
- Tiles: OpenStreetMap (gratuito, sem API key)
- 4 rotas: SP-222, SP-055, BR-116, Balsa Cananeia
- Cores por condicao: LIVRE (verde), MODERADO (amarelo), LENTO (laranja), BLOQUEADO (vermelho), OPERACIONAL (ciano)
- Coordenadas reais da regiao

### Hooks
| Hook | Descricao |
|------|-----------|
| useRegionalNews.ts | Busca GET /v1/noticias-regionais |

---

## Pagina de Comercio (Guia Completo)

### Estrutura
```
comercio/
  page.tsx                    # PageBanner + CommerceMap + CommerceGrid
  CommerceMap.tsx             # Leaflet com markers + OSRM routing
```

### Secoes da Pagina
1. **PageBanner** — Foto de capa com titulo "Comercio de Ilha Comprida"
2. **CommerceMap** — Mapa Leaflet com markers coloridos por setor + rotas OSRM
3. **CommerceGrid** — Grid de cards com filtros por setor e busca

### CommerceMap
- Tiles: OpenStreetMap (gratuito, sem API key)
- Markers: cores por setor (alimentacao=laranja, hospedagem=azul, comercio=verde, servicos=amarelo, lazer=roxo)
- Routing: OSRM (gratuito, sem API key)
- Marcador de localizacao do usuario

### CommerceGrid
- Filtros: Todos, Alimentacao, Hospedagem, Comercio, Servicos, Lazer
- Busca por nome e subsector
- Botoes: "Como Chegar" (OSRM) e "Maps" (link externo)

### Hooks
| Hook | Descricao |
|------|-----------|
| useComercio.ts | Busca GET /v1/comercio |

---

## Backlog P2 (conhecido, nao implementado)

Itens ja identificados, ainda sem correcao — nao abrir issue/PR para eles sem antes conferir esta lista:

1. **Trust proxy / X-Forwarded-For** — **FECHADO (04/11)**: `app.set('trust proxy', 1)` adicionado em `src/main.ts` (Nest/Express) e `api/index.ts` (handler Vercel) — o Express confia no 1o `X-Forwarded-For` (1 hop de proxy da Vercel) e o Throttler conta o IP real do cliente em vez do IP do proxy (antes, todo mundo rate-limited junto — risco de 429 em massa). **Verificacao pos-merge:** `X-RateLimit-Remaining` deve variar por cliente real
2. **Paralelizar refresh das 4 cidades** — **FECHADO (30/10)**: `refreshAll()` usa `Promise.allSettled` (meteorologia x4 + oceanografia + weather-news em paralelo) com resultado **por cidade** no `details` (`OK (4/4)` / `ERROR parcial (3/4 OK): ...`); o `saveFallback` do open-meteo serializa o read-modify-write do JSON via `writeLock` (evita last-writer-wins)
3. **`updatedAt` enganoso no fallback** — **FECHADO (30/10, modulo de meteorologia)**: `FallbackService` agora grava `contentAt` (coleta real, preservada ao reaproveitar conteudo) e `isStale` passou a considerar `contentAt`; em meteorologia o staleness e **por localidade** (`meta.fetchedAt`). Os demais modulos nao mesclam conteudo antigo no save — se passarem a fazer, devem repassar o `contentAt` ao `save()`
4. **Testes dos handlers `@Cron`** — os specs exercitam o metodo diretamente; o agendamento real do `@nestjs/schedule` continua nao coberto
5. **`qualityFor` euristica fixa** — a qualidade "melhor horario por fatores" ainda e regra fixa, sem modelo aprendido/calibrado
6. **Proveniencia da oceanografia estatica** — `getDefault()` do marine.repository ainda nao tem flag de proveniencia (`sample`/`source`), diferente de metereologia/news
7. **Dedup de normalize/flatten** — logica de normalizacao do `scripts/rag-index.mjs` e do runtime (chunker) pode eventualmente ser unificada
8. **`windGust` na UI** — o campo ja existe no contrato (`current.windGust` + `hourly[].windGust`, `null` em cache antigo) mas ainda nao e exibido nos cards de `/meteorologia` — exibir rajada junto do vento e opcional
9. **`hourly[].windDirection`** — removido da REFERENCIA_API na revisao 30/10 (o backend nunca o retornou; a doc estava errada). Se for necessario, adicionar `wind_direction_10m` ao `hourly=` da query do Open-Meteo e mapear no service

---

## Deploy em Produção

### URLs de Produção

| Serviço | URL |
|---------|-----|
| Frontend | `https://meteor2-0-frontend.vercel.app` |
| Backend | `https://meteor2-0-backend.vercel.app` |
| Health Check | `https://meteor2-0-backend.vercel.app/health` |

### Configuração de Variáveis de Ambiente

#### Frontend (Vercel)

A variável `NEXT_PUBLIC_API_URL` está configurada no arquivo `apps/frontend/.env.production`:

```
NEXT_PUBLIC_API_URL=/api
```

As chamadas `/api/*` são proxyadas pelo rewrite em `apps/frontend/vercel.json` para `https://meteor2-0-backend.vercel.app/*` (mesmo origin — sem problemas de CORS).

**Não é necessário configurar no Vercel Dashboard** — o Next.js usa automaticamente `.env.production` em builds de produção.

#### Backend (Vercel)

Variáveis configuradas no Vercel Dashboard (Settings → Environment Variables):

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `FRONTEND_ORIGIN` | `https://meteor2-0-frontend.vercel.app` | CORS origin |
| `CRON_SECRET` | *(secreto — sem default; obrigatorio para `GET/POST /v1/cron/refresh`; ausente/errado → 401)* | Auth dos endpoints de cron (Vercel envia `Authorization: Bearer` automaticamente) |
| `GEMINI_API_KEY` | *(chave secreta — formato AQ... desde Set/2026)* | API Gemini (resumo IA, chat Iron, embeddings RAG) |
| `GEMINI_MODEL` | `gemini-flash-latest` | Modelo Gemini (texto) |
| `GEMINI_EMBEDDING_MODEL` | `gemini-embedding-2` | Modelo de embeddings do RAG |
| `GEMINI_EMBEDDING_DIMS` | `128` | Dimensao dos vetores do RAG |
| `GEMINI_TEMPERATURE` | `0.7` | Temperatura |
| `FALLBACK_DIR` | `apps/backend/data` | Caminho dos `fallback-*.json` no bundle (cwd do lambda é a raiz do repo) |
| `NODE_OPTIONS` | `--experimental-require-module` | Habilita `require()` de deps ESM-only (Nest 12) |

### CI/CD (GitHub Actions)

Pipeline ativo em `.github/workflows/ci.yml`:

**Jobs:** (todos em Node 24 via `node-version-file: .nvmrc`)
- `backend-test`: Jest (217 testes) — `NODE_OPTIONS="--experimental-vm-modules" npx jest`
- `frontend-test`: Vitest (69 testes)
- `lint`: oxlint (frontend)
- `docs-check`: `node scripts/check-docs.mjs` (paridade rotas × REFERENCIA_API.md; local: `pnpm docs:check`)
- `build`: valida backend + frontend (após testes)

**Refresh de dados (05/11):** `.github/workflows/refresh-cron.yml` chama `POST /api/v1/cron/refresh` a cada 6h (`23 */6 * * *`) + `workflow_dispatch`, com `Authorization: Bearer ${{ secrets.CRON_SECRET }}`. **FECHADO (05/11):** repo secret `CRON_SECRET` criado em Settings → Secrets and variables → Actions com o MESMO valor da env `CRON_SECRET` do backend na Vercel — o guard do job (`[ -z "$CRON_SECRET" ]`) falha com exit 1 e mensagem clara no log se ele faltar. O plano Hobby limita o cron nativo da Vercel a 1 execucao/dia; este workflow cobre o resto sem tocar no deploy.

> **Rotacao (05/11):** o `CRON_SECRET` anterior estava em texto puro no arquivo `CRON_SECRET_STATUS.md` (commit `ddcb624`, repo publico) — o arquivo foi **removido** e o segredo **rotacionado** (`.env` local + env `CRON_SECRET` na Vercel + repo secret no GitHub). Nunca versionar o valor do segredo.

**Docs check (04/11):** `pnpm docs:check` compara as rotas declaradas nos controllers (`@Controller` + `@Get/@Post/...`) com as secoes `## GET/POST ...` da `especificacoes/REFERENCIA_API.md` — exit 1 se divergirem. Deterministico (conta rotas, nao testes/linhas). Nao esta encadeado no `pnpm verify` de proposito: `verify` espelha a CI (lint+test+build) e o `docs-check` roda como job proprio.

**Actions (runtime Node 24 — out/2026):** `actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v6`. As antigas `@v4` declaravam `node20` e geravam o aviso *"Node.js 20 está obsoleto... forçadas a serem executadas no Node.js 24"* em cada job.

### Fluxo de Deploy

1. Push para `main` dispara CI/CD automaticamente
2. Testes rodam em paralelo (backend + frontend + lint)
3. Build valida compilação
4. Vercel detecta mudanças e faz redeploy automático
5. Frontend e backend são redeployados independentemente

### Estrutura DevOps

```
DevOps/
├── README.md                    # Guia completo de deploy
├── frontend/
│   ├── vercel.json              # Cópia de referência do rewrite /api (o ativo é apps/frontend/vercel.json)
│   └── .vercelignore            # Arquivos ignorados
├── backend/
│   ├── Dockerfile               # Container — node:24-alpine (alternativa Railway/Render)
│   ├── railway.json             # Deploy Railway (alternativa)
│   └── render.yaml              # Deploy Render (alternativa)
├── github-actions/
│   └── ci.yml                   # Pipeline CI/CD (referência; a ativa é .github/workflows/ci.yml)
└── env/
    ├── .env.frontend.example    # Vars frontend
    └── .env.backend.example     # Vars backend
```

> **Ativo no deploy:** `apps/frontend/vercel.json` (rewrite `/api/*` → backend) — o Root Directory do projeto Vercel é `apps/frontend`, então só o arquivo de dentro de `apps/` é lido.

### Documentação Completa

Consulte `DevOps/README.md` para guia detalhado de deploy.
