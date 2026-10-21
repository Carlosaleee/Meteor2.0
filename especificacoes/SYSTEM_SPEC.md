# Especificacao Tecnica — Meteor 2.0

> **Ultima atualizacao:** 21/10/2026 (rota `GET /`, proxy `/api` no frontend, Node 24 + actions Node 24 na CI e validação de `FRONTEND_ORIGIN` multi-origin — 203 testes)
>
> **Documentos relacionados:** [GUIA_DESENVOLVEDOR.md](./GUIA_DESENVOLVEDOR.md) · [REFERENCIA_API.md](./REFERENCIA_API.md) · [../README.md](../README.md) · [../DESIGN.md](../DESIGN.md)

## Sumario

1. [Visao Geral](#1-visao-geral) · 2. [Arquitetura](#2-arquitetura) · 3. [Paginas Implementadas](#3-paginas-implementadas-7-rotas) · 4. [Backend Modulos](#4-backend--modulos) · 5. [Variaveis de Ambiente](#5-variaveis-de-ambiente) · 6. [Sistema de Fallback](#6-sistema-de-fallback) · 7. [Stack Tecnologica](#7-stack-tecnologica) · 8. [Fluxo de Branches](#8-fluxo-de-branches) · 9. [Cobertura de Testes](#9-cobertura-de-testes) · 10. [Estrutura de Diretorios](#10-estrutura-de-diretorios) · 11. [UI/UX Header Footer Nav](#11-uiux--header-footer-nav) · 12. [Pagina Previsao](#12-pagina-de-previsão-do-tempo-detalhes) · 13. [Pagina Swell](#13-pagina-de-swell-detalhes) · 14. [Deploy](#14-deploy-em-produção) · 15. [Imagens](#15-imagens) · [Anexo A: SSR](#anexo-a--correcao-de-erros-de-build-ssr) · [Anexo B: Vercel MCP](#anexo-b--configuracao-vercel-mcp)

---

## 1. Visao Geral

**Meteor 2.0** e um Dashboard Tatico (HUD) de telemetria e inteligencia de dados focado na regiao de **Ilha Comprida e Vale do Ribeira** (litoral sul de Sao Paulo). O sistema consome, cruza e normaliza dados dinamicos de multiplas fontes externas, fornecendo visualizacoes espaciais (mapas Leaflet) e resumos executivos.

---

## 2. Arquitetura

```
+---------------------------------------------------+
|                   MONOREPO (pnpm)                  |
+-------------------------+-------------------------+
|      apps/backend       |      apps/frontend      |
|      NestJS 12          |      Next.js 15         |
|      Porta 3001         |      Porta 3000         |
+-------------------------+-------------------------+
|                  pnpm-workspace.yaml               |
+---------------------------------------------------+
```

### Backend (NestJS)
- Padrao arquitetural: Controller > Service > Repository (3 camadas)
- Seguranca: Helmet, CORS, Throttler (60 req/min global, loopback isento) + **throttle dedicado de 5 req/min em `POST /v1/iron/chat`**
- Validacao: Zod (env schema + pipes)
- Resiliencia: FallbackService com JSONs diarios (marcados com `meta.source`/`source`/`sample` — ver secao 6)
- **Automacao:** RefreshService com @nestjs/schedule (cron 6h para dados pesados + cron 1h para rankings/noticias; startup e `@Cron` **pulados em serverless** `process.env.VERCEL` — o agendamento vem dos crons da Vercel)
- **IA:** GeminiClientService unico em `common/ai/` (texto via SDK `@google/genai`, embeddings via REST direto) + **RAG hibrido** (`modules/iron/rag/`) — ver secao 4.10

### Frontend (Next.js 15)
- App Router com React 19
- Estilizacao: Tailwind CSS v4 (design tokens via CSS custom properties)
- Tema: dark/light com `data-theme` + `localStorage` + `prefers-color-scheme`
- Mapas: Leaflet nativo (useRef + cleanup pattern) — tiles OpenStreetMap (gratuitos, sem API key)
- **SSR Protection:** Componentes Leaflet importados via `next/dynamic` com `{ ssr: false }` para evitar `ReferenceError: window is not defined` durante build estatico
- Hooks: useMeteorology, useSwell, useHourlyMarine, useAiSummary, useAllCities, useRegionalNews, useComercio, useNews, useWeatherNews (9 hooks)
- API Layer: lib/api.ts com fetch generico
- Icones: React Icons (Font Awesome)
- Graficos: ApexCharts (react-apexcharts)
- Acessibilidade: skip-link, aria-label, aria-current, aria-expanded, role, focus-visible, title tooltips

---

## 3. Paginas Implementadas (7 rotas)

| Rota | Descricao | Dados |
|------|-----------|-------|
| `/` | Portal principal - HUD Tatico | Estatico + ChatWidget + banner |
| `/meteorologia` | Previsão do Tempo & Vento | **API real** (4 cidades) + RainViewer radar + PageBanner |
| `/swell` | Swell & Points | **API real** + Gemini AI + ApexCharts + Leaflet |
| `/noticias` | Noticias Regionais + Transito | **RSS auto-atualizado** (ISN + Santa Portal + Google News) + TrafficMap Leaflet + CityGrid |
| `/comercio` | Comercio de Ilha Comprida | **API real** (fallback-comercio) + CommerceMap Leaflet + OSRM routing |
| `/blog` | Blog Tecnico | Estatico (4 artigos) |
| `/creditos` | Creditos & Fontes | Estatico |

> **Removidas no review 2026-09:** `/mapa` e `/transito` (paginas orfas sem link no Header/Footer; `/transito` tinha apenas mocks hardcoded). Componentes `SpotMap` e `BaseLeafletMap` tambem removidos.

---

## 4. Backend — Modulos

### 4.1 MeteorologyModule
- Endpoint: GET /v1/meteorology?locationId=
- API externa: Open-Meteo Forecast (gratuita, sem chave; fetch com timeout 10s — `common/http/fetch-timeout.ts`)
- Dados expandidos: current + hourly (24h) + daily (7 dias)
- Horario de referencia em `America/Sao_Paulo` (`common/time/sp-time.ts`) — corrige deslocamento de dia em serverless UTC
- Proveniencia: resposta inclui `source: 'live' | 'stale' | 'sample'` (repassado de `meta.source` do fallback)
- Fallback: data/fallback-meteorology.json (atualizado a cada 24h)
- Localizacoes: Ilha Comprida, Iguape, Cananeia, Registro
- `forceRefresh(lat, lon, locationId)` para refresh forcado por localizacao

### 4.2 OceanographyModule
- Endpoints:
  - GET /v1/oceanography — dados atuais (ondas, swell, qualidade, spots)
  - GET /v1/oceanography/hourly — previsao hourly 12h (wave_height, period, direction)
  - GET /v1/oceanography/summary — resumo tático gerado por Gemini AI
- API externa: Open-Meteo Marine (gratuita, sem chave; fetch com timeout 10s)
- IA: Gemini (`gemini-flash-latest` por padrao, `@google/genai` via **GeminiClientService unico** em `common/ai/gemini-client.service.ts`) — briefing tático de surf
- Fallback: data/fallback-oceanography.json (inclui spots, tides, quality)
- Dados: ondas, swell, marees, qualidade, spots de surf, resumo IA
- Cache: resumo IA cacheado por 1h no backend + **single-flight** (requisicoes simultaneas compartilham a mesma chamada Gemini)

### 4.3 TrafficModule
- Endpoint: GET /v1/traffic
- API externa: Nenhuma (simulacao baseada em horario)
- Fallback: data/fallback-traffic.json
- Rodovias: SP-222, BR-116, Balsa Cananeia

### 4.4 NoticiasRegionaisModule
- Endpoints:
  - GET /v1/noticias-regionais — noticias + rotas
  - GET /v1/noticias-regionais/news?category= — noticias filtradas por categoria
  - GET /v1/noticias-regionais/routes — status das rodovias
- API externa: RSS automatico — ISN Online (isnonline.com.br/feed), Santa Portal (santaportal.com.br/feed), Google News RSS ("Vale do Ribeira")
- Fallback: data/fallback-noticias-regionais.json (merge: RSS fresco + base, rolling 30 noticias + 5 rotas)
- Dados: noticias regionais do Vale do Ribeira (categorias: transito/policial/turismo/cotidiano/noticia por keyword) + status de rodovias (rotas estaticas)
- Cache: 30min em memoria; `forceRefresh()` re-coleta todos os feeds (cron 1h + a cada 6h)

### 4.5 ComercioModule
- Endpoints:
  - GET /v1/comercio — diretorio completo
  - GET /v1/comercio/commerce?sector= — comercios filtrados por setor
- API externa: Nenhuma (dados estaticos)
- Fallback: data/fallback-comercio.json (50 comercios de Ilha Comprida)
- Dados: diretorio comercial com geolocalizacao (5 setores: alimentacao, hospedagem, comercio, servicos, lazer)

### 4.6 NewsModule
- Endpoint: GET /v1/news
- API externa:
  - **WSL** (worldsurfleague.com) — ranking (`/championship-tour`), calendario (`/schedule`) e **noticias** (`/news`, cards server-rendered com `data-content-id`)
  - **Google News RSS (pt-BR)** — noticias "Paulista" de surfe. O dominio antigo **spsurf.com.br esta morto (NXDOMAIN)**, por isso o fluxo do `spsurf.repository` e: site legado → RSS Google News → lista padrao
- Ranking WSL: parser de tabela HTML real (`<tr class="athlete-*">` → rank/nome/pais/pontos/trend; `<tr class="event-*">` → eventos com status; Upcoming primeiro) — fallback hardcoded se parse < 5 entradas
  - **Fix 19/10:** `class="tour-points eliminated"` nao casava com `class="tour-points">` → antes so 7 homens/5 mulheres eram parseados (rankings com lacunas). Regex atual `tour-points[^>]*>\s*([\d,]+)\s*<` retorna top 15 sem buracos
  - **Fix 19/10:** eventos patrocinados eram descartados — a regex antiga exigia `...</a>`, mas o markup real e `<a ...>EDP Ericeira Pro<span class="event-schedule-details__sponsor">...</span></a>` (filho `<span>` quebra `([^<]+)</a>`). Regex atual so exige o texto imediatamente apos o `>`
- Fallback: data/fallback-news.json (atualizado pelo RefreshService)
- **Dados sinteticos marcados:** itens estaticos (WSL + extras, incl. Paulista/SPSurf) sao fixos com datas congeladas (set/2026) e trazem `sample: true`; o fallback interno do `spsurf.repository` tambem usa datas congeladas (set/2026) — nunca datas ou alertas inventados
- Dados: rankings WSL (men/women/events), noticias de surf (12: WSL + Paulista), calendario
- Repositories: news.repository (orquestador, async), wsl.repository (cache de rankings e noticias), spsurf.repository (cache 30min com clearCache; single-flight no coletor de noticias)

### 4.7 IronModule
- Endpoint: POST /v1/iron/chat — **stateless no servidor, stateful no cliente** (persona fixa + historico enviado pelo frontend)
- Body (Zod): `message` (1..500, obrigatorio), `history?` (ate 20 turnos `{role: 'user'|'assistant', content: 1..2000}`), `sessionId?` (ate 64 chars)
- Resposta (dentro do envelope global `{success, data, error}`): `data: { reply, data?: { contextCollected: true, ragHits: number }, sources?: [{ title, section?, source: 'docs'|'data', snippet }] }`
- Rate limit dedicado: **5 req/min por IP** (`@Throttle({ default: { limit: 5, ttl: 60_000 } })`), alem do global de 60 req/min
- IA: Gemini (`gemini-flash-latest`) via GeminiClientService unico — persona/estado persistente vem do `SYSTEM_INSTRUCTION` fixo + 1o turno de usuario com o contexto agregado; `history` do cliente vira turns estruturados `user`/`model` (max 20 turnos)
- **Timeout de 45s** na chamada ao Gemini (`GeminiClientService.generateText`) — ao expirar, `processMessage` cai no catch e devolve mensagem de fallback curta (nunca trava o chat)
- Validacao: Zod schema para input do usuario
- Contexto: Coleta dados de todos os modulos (Meteorology, Oceanography, Traffic, Comercio, NoticiasRegionais) e envia como contexto para Gemini; horario de referencia em `America/Sao_Paulo`
- RAG: consultas passam pelo RagModule (secao 4.10) — `ragHits` conta os chunks recuperados e `sources[]` devolve os trechos citados (falha de RAG nunca bloqueia a resposta; responde com `ragHits: 0`)
- Frontend (ChatWidget): envia `{ message, sessionId, history }` com ate 10 turnos de historico (filtrando entradas vazias para evitar 400 no Zod); desempacota o envelope global (`json.data?.reply ?? json.reply`); trata status 429 de forma dedicada (aviso amigável de limite de requisições); botoes Reiniciar (rotaciona `sessionId`) e Apagar (limpa a conversa), desabilitados durante digitacao; status anunciado em regiao `aria-live` (sr-only)

### 4.8 FallbackService (Global)
- Servico compartilhado entre todos os modulos
- Carrega fallback do disco de forma assincrona (fs.promises)
- Salva dados frescos quando API responde
- Verifica staleness (> 24h = stale)
- Fallback final: medias sazonais da regiao

### 4.9 RefreshService (Automacao)
- **Startup:** Executa refresh de todos os módulos ao iniciar (`onModuleInit`) — **pulado em serverless** (`process.env.VERCEL`): filesystem efemero, o agendamento vem dos crons da Vercel
- **Cron pesado:** a cada 6 horas (`@Cron('0 */6 * * *')`) — meteorologia, oceanografia, weather news, rankings, noticias, regionais
- **Cron de noticias:** a cada 1 hora (`@Cron('0 * * * *')`) → `refreshNews()` — apenas rankings WSL + noticias + regionais (leve)
- **Modulos afetados:** Meteorologia, Oceanografia, Noticias (WSL + Google News), Noticias Regionais (RSS)
- **Endpoints:**
  - `GET /v1/cron/status` — Retorna ultimo refresh (`lastRefresh`, `lastNewsRefresh`) e status
  - `POST /v1/cron/refresh` — Forca refresh completo manual; aceita `scope=news` para o refresh leve
  - `GET /v1/cron/refresh` — Mesmo refresh via GET (a Vercel so dispara crons com GET); aceita `scope=news`
- **Autenticacao dos endpoints de refresh (ambos os verbos):** exige o `CRON_SECRET` **real** (sem default). Aceito por `Authorization: Bearer <secret>` (mecanismo nativo dos crons da Vercel), header `x-cron-secret` ou `?secret=<secret>` (GET). Sem `CRON_SECRET` configurado ou com valor errado → **401 Unauthorized**
  - **Removido:** bypass pelo header `x-vercel-cron: 1` (spoofavel por qualquer cliente) e o default `meteor-refresh-secret`
- **Crons da Vercel** (`apps/backend/vercel.json`): **unico** `0 3 * * *` (03:00 UTC — limite do plano Hobby: 1 cron/dia) → refresh completo; refresh leve via `?scope=news` so em uso local/manual
- **RAG:** apos `refreshAll()` e `refreshNews()`, o service dispara a reconstrucao do indice de dados do RAG (secao 4.10) com single-flight `rag:rebuild`
- **Metodos novos nos repositories:**
  - `open-meteo.repository.ts`: `forceRefresh(lat, lon, locationId)`
  - `marine.repository.ts`: `forceRefresh(lat, lon)`
  - `news.repository.ts`: `forceRefresh()`
  - `wsl.repository.ts`: `clearCache()`
  - `spsurf.repository.ts`: `clearCache()`
  - `noticias-regionais.repository.ts`: `forceRefresh()` (re-coleta RSS)

### 4.10 RagModule (RAG)
- **Modulo:** `apps/backend/src/modules/iron/rag/` — `rag.module.ts`, `rag.service.ts`, `chunker.ts`, `scoring.ts`, `index.store.ts`, `rag.types.ts`
- **Retrieval hibrido** (`RagService.retrieve`): embeddings Gemini (`GEMINI_EMBEDDING_MODEL`) + BM25 lexical, combinados com **60% semantico / 40% lexical**; topK = **3**; sem embedding (API indisponivel ou embeddings faltando) degrada para BM25 puro
- **Cache LRU de consultas:** `Map<query, {hits, expiresAt}>` — TTL de **5 min**, max **50 entradas** (re-insercao move para o fim; expiracao remove na leitura)
- **Embeddings:** via REST direto no `GeminiClientService` (lote de 20, ate 40 chunks por rebuild); dimensoes `GEMINI_EMBEDDING_DIMS` (padrao 128)
- **Indice de docs (versaoado):** `apps/backend/data/rag-index-docs.json` — **206 chunks / 198 embeddings**; regenerar com `pnpm --filter backend rag:index` (`apps/backend/scripts/rag-index.mjs`, reusa embeddings ja existentes no arquivo); entra no bundle da Vercel via `includeFiles: **/data/*.json` (`vercel.json`)
- **Indice de dados (runtime):** reconstruido pelo `RefreshService` apos `refreshAll()`/`refreshNews()` (single-flight `rag:rebuild`), indexando os JSONs de fallback (metereologia, oceanografia, weather-news, noticias); gravado via `FallbackService` (`rag-index-data.json`, `/tmp` em producao)
- **Uso:** `IronModule` consulta o RagService antes de responder — os chunks entram no contexto do Gemini e os melhores viram `sources[]` na resposta; falha de RAG nunca bloqueia o chat

---

## 5. Variaveis de Ambiente

Schema validado com Zod em `apps/backend/src/common/config/env.schema.ts` (`parseEnv`).

> **Fix 19/10:** `parseEnv` agora devolve `{ ...raw, ...envSchema.parse(raw) }`. O `validate` do `@nestjs/config` publica **apenas** o objeto retornado em `process.env`, e o Zod (strip por padrao) descartava as chaves fora do schema — `CRON_SECRET` ficava `undefined`. Chaves fora do schema agora continuam disponiveis em `process.env` (lidas cru pelo `CronController`), sem entrar na tipagem de `Env`. **Nao existe mais default de `CRON_SECRET`** — sem ele (ou com valor errado) o endpoint de refresh responde 401.

### Ativamente usadas
| Variavel | Default | Descricao |
|----------|---------|-----------|
| PORT | 3001 | Porta do backend |
| FRONTEND_ORIGIN | http://localhost:3000 | CORS origin |
| FALLBACK_DIR | data | Diretorio dos JSONs de fallback |
| FALLBACK_MAX_AGE_HOURS | 24 | Idade maxima do fallback |
| NEXT_PUBLIC_API_URL | dev: `http://localhost:3001` — prod: `/api` (proxy) | URL da API no frontend. Em produção o valor localhost é **descartado** pelo guard de `API_BASE` (`lib/api.ts`) e cai no proxy `/api/*` (rewrite em `apps/frontend/vercel.json`) |

### Definidas (em uso)
| Variavel | Default | Modulo |
|----------|---------|--------|
| NODE_ENV | development | Enum: development/test/production (validada no schema; lida pelo tooling) |
| GEMINI_API_KEY | (vazio) | OceanographyModule (resumo IA) + IronModule (chat) + RAG (embeddings) |
| GEMINI_MODEL | gemini-flash-latest | OceanographyModule / IronModule |
| GEMINI_EMBEDDING_MODEL | gemini-embedding-2 | RagModule (embeddings do indice de docs e dados) |
| GEMINI_EMBEDDING_DIMS | 128 | RagModule (dimensao dos vetores — 128 basta para ~200 chunks) |
| GEMINI_TEMPERATURE | 0.7 | OceanographyModule |
| GEMINI_API_BASE_URL | https://generativelanguage.googleapis.com/v1beta/models | Usada pelo REST direto de embeddings (o `generateText` do SDK usa a URL padrao do SDK) |
| STORMGLASS_API_KEY | (vazio) | Reservada (Oceanografia avancada) |
| INMET_API_TOKEN | (vazio) | Reservada |
| INMET_BASE_URL | apitempo.inmet.gov.br | Declarada no schema (weather-news.repository usa URL direta) |
| GITHUB_TOKEN | (vazio) | Consumida apenas pelo MCP local (`.opencode/mcp/github-server.mjs`) |
| CRON_SECRET | *(sem default)* | RefreshService/CronController — lida via `process.env` cru, fora do schema Zod; **obrigatória** (ausente ou errada → 401 em `GET/POST /v1/cron/refresh`; setar no dashboard da Vercel em producao) |

> **[LLM_CONTEXT] Migracao das Chaves Gemini API (Set/2026)**
> - Formato antigo (descontinuado): `AIzaSy...`
> - Formato novo (recomendado): `AQ.SUA_CHAVE_AQUI` — obter em https://aistudio.google.com/apikey
> - O SDK `@google/genai` aceita ambos os formatos (mudanca transparente para o codigo)
> - Endpoints que usam Gemini: `GET /v1/oceanography/summary`, `POST /v1/iron/chat` e o RagModule (embeddings)
> - **API Gemini (out/2026):** `gemini-2.5-flash` nao esta disponivel para chaves novas (o default do schema agora e `gemini-flash-latest`); endpoints de embedding usam schema `content` (singular), nao `contents[]` — chamados via REST direto em `common/ai/gemini-client.service.ts`

---

## 6. Sistema de Fallback

```
Requisicao > API Externa OK? --SIM--> Salva no JSON + Retorna dados reais
                |
                NAO
                |
           JSON existe? --SIM--> JSON stale? --NAO--> Retorna JSON fresco
                |                      |
                NAO                   SIM
                |                      |
           Retorna default         Retorna JSON stale
           sazonal
```

**Arquivos de fallback:**
- data/fallback-meteorology.json — Dados por localizacao (current + hourly + daily)
- data/fallback-oceanography.json — Ondas, swell, marees, spots
- data/fallback-traffic.json — Rodovias com simulacao por horario (estatico — sem API externa)
- data/fallback-comercio.json — 50 comercios de Ilha Comprida (estatico — sem API externa)
- data/fallback-noticias-regionais.json — rolling 30 noticias regionais (RSS auto) + 5 rotas de transito
- data/fallback-news.json — Noticias WSL + SPSurf
- data/fallback-weather-news.json — Criado em runtime pelo weather-news.repository (pode nao existir em clone novo)
- data/rag-index-docs.json — Indice RAG da documentacao (206 chunks / 198 embeddings; regenerar via `pnpm --filter backend rag:index`)
- data/rag-index-data.json — Indice RAG dos dados em runtime (reconstruido pelo RefreshService; criado na primeira requisicao)

**Dados sinteticos sao sempre marcados (nunca se passam por "ao vivo"):**
- Open-Meteo: `meta.source: 'live' | 'stale' | 'sample'` no fallback (defaults sao deterministicos, sem `Math.random`)
- Weather-news: `source: 'live' | 'cached' | 'sample'` na resposta; os itens de exemplo (`sample: true`) sao todos `boletim` com data congelada (2026-01-01) — **nunca alertas inventados**
- News (WSL + extras, incl. Paulista/SPSurf): `sample: true` com datas congeladas (set/2026); o fallback interno do `spsurf.repository` tambem usa datas congeladas (set/2026)

> **Nota:** `apps/backend/data/*.json` e gitignored, **exceto `fallback-*.json` e `rag-index-docs.json`** (`.gitignore` tem `!apps/backend/data/fallback-*.json` e `!apps/backend/data/rag-index-docs.json`) — os 6 JSONs de fallback e o indice RAG de docs sao **versionados** para compor o bundle serverless (`includeFiles: **/data/*.json` no `vercel.json`); commits `fix(data)` os re-sincronizam com dados frescos. Os demais JSONs (ex.: `fallback-weather-news.json`, `rag-index-data.json`) sao criados na primeira requisicao bem-sucedida. Em serverless a escrita vai para `/tmp`.

**Automacao de refresh:**
- Startup: todos os dados sao atualizados ao iniciar o backend (**pulado em serverless** — `process.env.VERCEL`)
- Cron: a cada 6 horas (dados pesados) + a cada 1 hora (rankings WSL + noticias + regionais) via @nestjs/schedule (handlers `@Cron` **pulados em `VERCEL`** — o agendamento real vem do cron `0 3 * * *` do `vercel.json`)
- Manual: `GET/POST /v1/cron/refresh` autenticado com `CRON_SECRET` (`Authorization: Bearer`, header `x-cron-secret` ou `?secret=` no GET)

---

## 7. Stack Tecnologica

### Frontend
- Next.js 15.4 (App Router)
- React 19.1
- TypeScript 5.9
- Tailwind CSS v4
- Leaflet 1.9 (mapas)
- ApexCharts 7.x (graficos de ondas e marees)
- React Icons 5.7 (icones Font Awesome)
- Vitest (testes)

### Backend
- NestJS 12 (`@nestjs/* ^12.0.4`)
- @nestjs/throttler ^6.7.0 (rate limit 60 req/min global + 5 req/min dedicado em `POST /v1/iron/chat`; import estatico no `app.module.ts`)
- @nestjs/schedule ^12.0.2 (crons 1h/6h — pulados em `VERCEL`)
- Node.js + Express
- TypeScript 5.9
- Zod (validacao)
- Helmet (seguranca)
- @google/genai (Gemini AI — resumo tático, chat Iron e embeddings RAG)
- Jest 30.5 (testes — requer `--experimental-vm-modules` p/ Nest 12 ESM)

### Infra
- pnpm 11.10 (monorepo)
- Node 24 (CI e dev local — Nest 12 e ESM-only e o Jest 30 exige Node 24.9+ para `require(esm)`)
- Conventional Commits
- oxlint (frontend lint)
- ESLint + Prettier

---

## 8. Fluxo de Branches

**Regras:**
1. Toda alteracao e feita em branch tematica
2. Commits em padrao Conventional Commits
3. Merge na main apos validacao
4. Proibido commit direto na main

**Branches:**
| Branch | Descricao |
|--------|-----------|
| `main` | Producao — todas as features mergeadas via PR (inclui a correcao do Iron, timeout 45s e RAG topK=3 + cache LRU, mergeada no PR #1) |
| `feature/plano-recuperacao-2026-10` | Plano de recuperacao (CI, serverless, dados frescos) — merged/estavel |

> Branches tematicas sao **removidas apos o merge** (limpeza pos-merge). O fluxo e sempre: branch da feature → PR → CI verde → merge na `main` → deletar branch.

---

## 9. Cobertura de Testes

**Total: 203 testes — backend Jest (160) + frontend Vitest (43)**

> Contagem atualizada apos execucao dos testes em 21/10/2026.

### Backend (Jest) — 160 testes em 26 arquivos
| Arquivo | Testes | Status |
|---------|--------|--------|
| refresh.service.spec.ts | 18 | ✅ |
| noticias-regionais.repository.spec.ts | 11 | ✅ (RSS com mock) |
| wsl.repository.spec.ts | 11 | ✅ (fixture WSL real + `eliminated` + sponsor + notícias) |
| cron.controller.spec.ts | 10 | ✅ (auth Bearer/`x-cron-secret`/`?secret=`, 401, scope) |
| gemini-chat.repository.spec.ts | 10 | ✅ (persona, turns user/model, contexto 1o turno) |
| iron.service.spec.ts | 9 | ✅ (inclui RAG no contexto; provider GeminiContextBuilder mockado) |
| rag.service.spec.ts | 12 | ✅ (retrieval hibrido topK=3, cache LRU hit/expiracao) |
| gemini-client.service.spec.ts | 4 | ✅ (novo — timeout 45s, sucesso, erro, sem API key) |
| scoring.spec.ts | 7 | ✅ (novo — BM25 + cosseno) |
| chunker.spec.ts | 6 | ✅ (novo — segmentacao de documentos) |
| meteorology.controller.spec.ts | 5 | ✅ |
| meteorology.service.spec.ts | 5 | ✅ |
| weather-news.repository.spec.ts | 5 | ✅ |
| news.repository.spec.ts | 5 | ✅ (novo — 12 notícias, fallback, persistência) |
| env.schema.spec.ts | 5 | ✅ (novo — defaults, coerção, chaves fora do schema) |
| spsurf.repository.spec.ts | 5 | ✅ (inclui fallback Google News RSS) |
| gemini.repository.spec.ts | 5 | ✅ |
| comercio.service.spec.ts | 4 | ✅ |
| news.service.spec.ts | 4 | ✅ |
| noticias-regionais.service.spec.ts | 4 | ✅ |
| oceanography.service.spec.ts | 4 | ✅ |
| traffic.service.spec.ts | 4 | ✅ |
| api-health.spec.ts | 2 | ✅ |
| envelope.interceptor.spec.ts | 2 | ✅ |
| fallback.service.spec.ts | 2 | ✅ |
| http-exception.filter.spec.ts | 1 | ✅ |

### Frontend (Vitest + RTL) — 43 testes em 9 arquivos
| Arquivo | Testes | Status |
|---------|--------|--------|
| ChatWidget.test.tsx | 14 | ✅ (envelope, resposta legada, rate limit 429, reiniciar/apagar, aria-live, sessionId/historico) |
| ResumoIA.test.tsx | 6 | ✅ |
| useWeatherNews.test.ts | 5 | ✅ |
| api.test.ts | 4 | ✅ |
| Footer.test.tsx | 3 | ✅ |
| useComercio.test.ts | 3 | ✅ |
| useMeteorology.test.ts | 3 | ✅ |
| useSwell.test.ts | 3 | ✅ |
| useAllCities.test.ts | 2 | ✅ |

> **Nota (review 2026-09):** `utils.test.ts` (11 testes) foi removido junto com `lib/utils.ts` — o teste so exercitava a propria lib morta; as paginas usam implementacoes locais mais ricas.

---

## 10. Estrutura de Diretorios

```
Meteor_2.0/
  apps/
    backend/
      src/
        common/
          ai/ (gemini-client.service.ts — cliente unico Gemini: texto via SDK, embeddings via REST)
          async/ (single-flight.ts)
          config/ (env.schema.ts, locations.ts — apenas SURF_CENTER)
          fallback/fallback.service.ts
          http/ (api-envelope, envelope.interceptor, http-exception.filter, fetch-timeout.ts + specs)
          refresh/ (refresh.service, refresh.module, cron.controller)
          time/ (sp-time.ts — horario America/Sao_Paulo)
        modules/
          meteorology/ (controller, service, repository)
          oceanography/ (controller, service, marine.repository, gemini.repository)
          traffic/ (controller, service, repository)
          noticias-regionais/ (controller, service, repository)
          comercio/ (controller, service, repository)
          iron/ (controller, service, gemini-chat.repository)
            rag/ (rag.module, rag.service, chunker, scoring, index.store, rag.types)
          news/ (controller, service, wsl.repository, spsurf.repository)
        app.module.ts
        main.ts
      data/ (fallback JSONs + rag-index-docs.json versionado)
      scripts/rag-index.mjs (regenera o indice RAG de docs — `pnpm --filter backend rag:index`)
    frontend/
      src/
        app/
          meteorologia/
            page.tsx (PageBanner + cards temperatura + LocationSelector + Tabs)
            components/ (13 componentes)
          swell/
            page.tsx (5 abas: Visao Geral, Noticias, Previsao, Vento, Picos)
            components/ (21 arquivos — ver secao 13)
          noticias/
            page.tsx (PageBanner + TrafficMap + CityGrid + filtros + grid noticias)
            components/ (TrafficMap)
          comercio/
            page.tsx (PageBanner + CommerceMap + CommerceGrid)
            CommerceMap.tsx (Leaflet + OSRM routing)
          blog/page.tsx
          creditos/page.tsx
          page.tsx (portal principal)
          layout.tsx, error.tsx, loading.tsx (raiz App Router)
        components/
          Header.tsx (nav responsiva + toggle idioma pt/es)
          Footer.tsx (4 colunas: Navegacao, Fontes de Dados, Stack Tecnologica, Links uteis)
          PageBanner.tsx (hero reutilizavel — banner-meteor.jpg)
          ChatWidget.tsx + ChatContext.tsx (bot flutuante; botoes Reiniciar/Apagar, aria-live, sessionId + historico de ate 10 turnos)
          HeroCarousel.tsx, ScrollToTopButton.tsx
        hooks/
          useMeteorology.ts
          useSwell.ts
          useHourlyMarine.ts (dados hourly 12h)
          useAiSummary.ts (resumo Gemini)
          useAllCities.ts (4 cidades paralelo)
          useRegionalNews.ts (noticias regionais + rotas)
          useNews.ts (noticias WSL/SPSurf — refetch useCallback estavel)
          useWeatherNews.ts (auto-refresh 10min)
          useComercio.ts (diretorio comercial)
          *.test.ts (5 arquivos de teste de hooks)
        lib/
          api.ts (client HTTP + tipos)
          spots-data.ts (dados estaticos de picos)
        app/globals.css (CSS custom properties + temas)
      public/
        banner-meteor.jpg (imagem de banner)
        CapaMeteor.jpg (imagem de capa original)
      .env.local
  especificacoes/ (documentacao)
  pnpm-workspace.yaml
  package.json
  .env
  DESIGN.md
```

---

## 11. UI/UX — Header, Footer, Nav

### Header
- Logo "Meteor" com icone FaWater
- Linha dourada `bg-[var(--color-gold-line)]` entre hero e nav
- Toggle tema: FaSun/FaMoon
- Nav responsiva: horizontal desktop, hamburger mobile

### Nav Bar (Responsiva)
- **Desktop (md+):** `hidden md:flex` — horizontal centrado com 7 itens
- **Mobile:** Hamburger (`FaBars`/`FaTimes`) com dropdown vertical
- **Ordem:** Principal > Previsão do Tempo > Swell > Noticias > Comercio > Blog > Creditos
- Pagina ativa: borda dourada `border-b-2` (desktop) / `border-l-2` (mobile)
- Hover dourado: `hover:bg-nav-hover-bg hover:text-nav-hover-text`
- Fecha automaticamente ao navegar (`useEffect` com `pathname`)
- Acessibilidade: `aria-expanded`, `aria-controls`, `aria-current="page"`

### Footer (4 Colunas — Layout Atualizado)
- **Linha 1:** "METEOR 2.0" centralizado em dourado + descricao do projeto
- **Coluna 1 — Navegacao:** 6 links internos (Previsao do Tempo, Swell & Points, Noticias Regionais, Comercio, Blog Tecnico, Creditos & Fontes)
- **Coluna 2 — Fontes de Dados:** Open-Meteo, INMET, RainViewer, CPTEC/INPE, OpenStreetMap
- **Coluna 3 — Stack Tecnologica:** Next.js 15, NestJS, Tailwind CSS, Leaflet, TypeScript
- **Coluna 4 — Links Uteis:** Contatos de emergencia `tel:` (190, 193, 192, 199, 197, Hospital Regional)
- **Rodape:** ano atual + "Meteor — Creditos de Desenvolvimento: Carlos Alexandre"
- Linha dourada `bg-[var(--color-gold-line)]` no topo
- Links externos com `FaExternalLinkAlt` no hover
- Acessibilidade: `role="contentinfo"`, `aria-label`, `focus-visible` rings

### Sistema de Tema (Dark/Light)
- Variaveis CSS em `globals.css` via `@theme` (dark) e `[data-theme="light"]` (light)
- Persistencia: `localStorage.getItem('meteor-theme')`
- Deteccao: `window.matchMedia('(prefers-color-scheme: light)')`
- Aplicacao: `document.documentElement.setAttribute('data-theme', 'light')`
- Componentes usam `var(--color-*)` em vez de classes hardcoded

### Acessibilidade
- Skip-link: "Pular para o conteudo principal" (visivel no focus)
- `role="banner"` (header), `role="navigation"` (nav), `role="contentinfo"` (footer)
- `role="menubar"` / `role="menuitem"` nos links de navegacao
- `aria-current="page"` na pagina ativa
- `aria-pressed` nos botoes de toggle
- `aria-hidden="true"` em icones decorativos
- `focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]` em todos os elementos interativos
- `<main id="main-content" role="main">` para skip-link
- **Title tooltips em todos os elementos interativos** (botoes, cards, links)
- `aria-live="polite"` para atualizacoes de dados

---

## 12. Pagina de Previsão do Tempo (Detalhes)

### Estrutura Principal
- **Container:** `<main>` com `bg-slate-950 border border-slate-800 rounded-2xl`
- **PageBanner:** Foto de capa (banner-meteor.jpg) com titulo e subtitulo
- **Cards Temperatura:** 4 cards de temperatura por cidade (estilo dark, amber no ativo)
- **Botao Atualizar:** Atualiza dados meteorologicos
- **LocationSelector:** 4 cidades com tooltips descritivos
- **MeteorologyTabs:** 4 abas com tooltips (Avisos, Previsao, Satelite, Numerica)
- **Conteudo:** Mapa, MetricCards, HourlyTimeline, DailyForecast, CityGrid

### Hero Layout
- PageBanner (foto de capa) como primeiro elemento
- Cards de temperatura em linha abaixo do banner
- Botao Atualizar ao lado dos cards

### Componentes (13 arquivos em meteorologia/components/)
| Componente | Descricao |
|------------|-----------|
| LocationSelector.tsx | Selecao de cidade com tooltips |
| MeteorologyTabs.tsx | 4 abas com tooltips |
| PrevisaoTab.tsx | Layout principal: Mapa > Banner > Cards > Hourly > Daily > News |
| WeatherMapDetail.tsx | Leaflet com radar RainViewer |
| MetricCard.tsx | Card de metrica com tooltip explicativo |
| HourlyTimeline.tsx | Grid responsivo 24h (auto-fill minmax(72px)) |
| DailyForecast.tsx | Previsao 7 dias com tooltips |
| CityGrid.tsx | Noticias meteorologicas com links reais |
| AvisosTab.tsx | Alertas oficiais com links (INMET, Defesa Civil, Marinha) |
| SatelliteTab.tsx | Imagens de satelite |
| NumericaTab.tsx | Modelos numericos com radar RainViewer |
| Skeletons.tsx | Loading states |
| weather-utils.ts | Funcoes utilitarias (emoji, descricao, formatacao) |

### Acessibilidade (Previsão do Tempo)
- `title` em todos os botooes e cards interativos
- `aria-label` em todas as secoes
- `aria-live="polite"` para atualizacoes
- `role="radiogroup"` no LocationSelector
- `role="tablist/tab/tabpanel"` nas abas
- Tooltips descritivos: "Clique para ver previsao de Ilha Comprida — praia e litoral"
- Tooltips de metricas: "Temperatura do ar em graus Celsius"
- Grid responsivo HourlyTimeline: 4 colunas mobile, 8 tablet, 12 desktop

### Fontes de Dados (Reais)
- **Open-Meteo:** Previsao do tempo (gratuita)
- **RainViewer:** Radar de precipitacao em tempo real (gratuita, sem API key)
- **INMET:** Avisos meteorologicos oficiais
- **CPTEC/INPE:** Previsao numerica brasileira
- **Defesa Civil SP:** Alertas de desastres
- **Marinha do Brasil:** Avisos maritimos

---

## 13. Pagina de Swell (Detalhes)

### Estrutura Principal
- **Container:** `<div className="space-y-8">` com PageBanner + Hero + Tabs + Conteudo
- **Hero:** Gradient blue com qualidade, melhor horario, botao Atualizar
- **KPI Cards:** 4 cards (Altura, Swell, Direcao, Mare)
- **SwellTabs:** 5 abas (padrao `overview`): **Visao Geral → Noticias → Previsao de Ondas → Previsao de Ventos → Points**

### Abas e Conteudo

#### Visao Geral (aba padrao — `OverviewTab.tsx`)
- **ResumoIA:** Briefing Gemini com topicos (Ondas, Vento, Horarios, Points, Alertas)
- **ConditionCards + WindConditionCards:** mini cards de condicoes (onda/swell/periodo/direcao/qualidade + vento)
- **HourlySwell:** grid 12 horas com classificacao de qualidade
- **SurfNews:** noticias por categoria
- **DailyTip:** dica pratica + prancha recomendada
- **ForecastSection:** previsao por horario

#### Noticias (`news`)
- **SurfNews** (WSL) e **SurfNews** (Circuito Paulista) com imagens reais (Unsplash)
- **WslRankings:** rankings masc/fem (dados reais do WSL via backend `wsl.repository`)
- **UpcomingEvents:** proximos eventos com status
- Grid responsivo: 1 coluna mobile, 2 tablet, 3 desktop; links externos para fontes oficiais

#### Previsao de Ondas (`forecast`)
- **ForecastSection:** condicoes, grafico, mareis e resumo IA
- **WaveChart:** grafico ApexCharts area com 2 series (Onda + Swell), faixas de qualidade tracejadas, tooltip detalhado, altura 350px
- **TideChart:** grafico ApexCharts linha com annotations + tabela das proximas 4 mareis (320px)
- **HourlySwell / ResumoIA / DailyTip**

#### Previsao de Ventos (`wind`)
- **WindConditionCards:** velocidade, rajada e direcao (kitesurf/windsurf)
- **WindChart:** grafico ApexCharts de vento
- **HourlyWind:** grid 12 horas de vento (usa `windEmoji` local)

#### Points (`spots`)
- **SpotsMap:** Leaflet com marcadores coloridos
- **SpotGrid:** cards com filtros (Iniciante/Intermediario/Avancado) e busca

### Componentes (21 arquivos em swell/components/)
| Componente | Descricao |
|------------|-----------|
| SwellTabs.tsx | 5 abas com aria pattern (padrao `overview`) |
| OverviewTab.tsx | Aba Visao Geral (orquestra os componentes abaixo) |
| ResumoIA.tsx (+ .test.tsx) | Briefing Gemini com markdown — 6 testes |
| ForecastSection.tsx | Secao de previsao horaria (forecast/wind) |
| WaveChart.tsx | Grafico ApexCharts area (ondas) |
| WindChart.tsx | Grafico ApexCharts (vento) |
| TideChart.tsx | Grafico ApexCharts linha (mares) |
| SpotGrid.tsx | Cards de spots com filtros e busca |
| SpotsMap.tsx | Mapa Leaflet dos points |
| SurfNews.tsx | Noticias por categoria |
| WslRankings.tsx | Rankings WSL masc/fem |
| UpcomingEvents.tsx | Proximos eventos |
| HourlySwell.tsx | Grid responsivo 12h (ondas) |
| HourlyWind.tsx | Grid responsivo 12h (vento) |
| ConditionCards.tsx | 5 mini cards de condicoes |
| WindConditionCards.tsx | Mini cards de vento |
| DailyTip.tsx | Dica pratica do dia |
| CommerceGrid.tsx | Grid de comercio (compartilhado com /comercio) |
| Skeletons.tsx | Loading states |
| windUtils.ts | Helpers de vento (classificacao, direcao) |

### Hooks (9 hooks)
| Hook | Descricao |
|------|-----------|
| useMeteorology.ts | Busca GET /v1/meteorology |
| useSwell.ts | Busca GET /v1/oceanography |
| useHourlyMarine.ts | Busca GET /v1/oceanography/hourly |
| useAiSummary.ts | Busca GET /v1/oceanography/summary |
| useAllCities.ts | Busca 4 cidades em paralelo |
| useNews.ts | Busca GET /v1/news (refetch via `useCallback` estavel — corrige loop de atualizacao) |
| useWeatherNews.ts | Busca GET /v1/meteorology/news (auto-refresh 10min) |
| useRegionalNews.ts | Busca GET /v1/noticias-regionais |
| useComercio.ts | Busca GET /v1/comercio |

### Acessibilidade (Swell)
- `role="tablist/tab/tabpanel"` nas abas
- `aria-selected`, `aria-controls`, `tabIndex` roving
- `title` em todos os cards e botões
- `aria-label` em todas as seções
- `aria-live="polite"` para resumo IA
- `focus-visible:ring-2 focus-visible:ring-blue-400`
- Tooltips detalhados com todos os valores

### Fontes de Dados (Reais)
- **Open-Meteo Marine:** Dados de ondas, swell, período (current + hourly)
- **Gemini (`gemini-flash-latest`):** Resumo tático de surf (briefing com 5 tópicos)
- **Leaflet + OpenStreetMap:** Mapa de picos de surf
- **Unsplash:** Imagens de notícias (thumbnails)

---

## 14. Deploy em Produção

### URLs de Produção

| Serviço | URL |
|---------|-----|
| Frontend | `https://meteor2-0-frontend.vercel.app` |
| Backend | `https://meteor2-0-backend.vercel.app` |
| Health Check (direto) | `https://meteor2-0-backend.vercel.app/health` (a raiz `/` responde o mesmo) |
| Health Check (via proxy do frontend) | `https://meteor2-0-frontend.vercel.app/api/health` |

> **Smoke test de integração (out/2026):** `frontend/api/*` faz proxy para o backend pelo rewrite em `apps/frontend/vercel.json` (mesmo origin, sem CORS). Se `/api/health` responder o envelope de sucesso, frontend e backend estão conectados.

### Plataformas

| App | Plataforma | Tipo |
|-----|-----------|------|
| Frontend (Next.js) | Vercel | Serverless (static + ISR) |
| Backend (NestJS) | Vercel | Serverless (API routes) |

### Variáveis de Ambiente (Produção)

#### Frontend (Vercel)
| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NEXT_PUBLIC_API_URL` | `/api` (proxy → backend) | URL da API backend (bundled no JS) |

Configurado em: `apps/frontend/.env.production`

#### Backend (Vercel)
| Variável | Valor | Descrição |
|----------|-------|-----------|
| `FRONTEND_ORIGIN` | `https://meteor2-0-frontend.vercel.app` | CORS origin |
| `CRON_SECRET` | *(secreto — sem default; obrigatorio para `GET/POST /v1/cron/refresh`; ausente/errado → 401)* | Auth dos endpoints de cron (aceita `Authorization: Bearer`, `x-cron-secret` ou `?secret=` no GET) |
| `GEMINI_API_KEY` | *(chave secreta — formato AQ... desde Set/2026)* | API Gemini para resumo IA, chat Iron e embeddings RAG |
| `GEMINI_MODEL` | `gemini-flash-latest` | Modelo Gemini (chat/resumo) |
| `GEMINI_EMBEDDING_MODEL` | `gemini-embedding-2` | Modelo de embeddings do RAG |
| `GEMINI_EMBEDDING_DIMS` | `128` | Dimensao dos vetores do RAG |
| `GEMINI_TEMPERATURE` | `0.7` | Temperatura Gemini |
| `FALLBACK_DIR` | `apps/backend/data` | Caminho dos `fallback-*.json` no bundle (cwd do lambda é a raiz do repo) |
| `NODE_OPTIONS` | `--experimental-require-module` | Habilita `require()` de deps ESM-only (Nest 12) |

#### Backend serverless (arquivos no repo)
| Arquivo | Papel |
|---------|-------|
| `apps/backend/api/index.ts` | Handler da função — NestJS via `ExpressAdapter` + helmet + CORS |
| `apps/backend/vercel.json` | `routes` (todas as rotas → handler), `regions: gru1`, `maxDuration: 30`, `memory: 1024`, `includeFiles: **/data/*.json`, cron único `0 3 * * *` (03:00 UTC — limite Hobby: 1 cron/dia) |
| `apps/backend/package.json` | deps `express` + `@vercel/node` |

> **Validação (05/10):** handler compilado e invocado localmente com `VERCEL=1` → `/health`, `/v1/cron/status` e `/v1/comercio/commerce` retornaram 200 e o startup refresh foi pulado corretamente.

### CI/CD (GitHub Actions)

Pipeline em `.github/workflows/ci.yml`:

| Job | Descrição | Trigger |
|-----|-----------|---------|
| `backend-test` | Jest (160 testes) | push/PR |
| `frontend-test` | Vitest (41 testes) | push/PR |
| `lint` | oxlint (frontend) | push/PR |
| `build` | Valida compilação | Após testes |

> **pnpm na CI:** `pnpm/action-setup@v6` sem input `version` — a versão única vem de `packageManager: pnpm@11.10.0` no `package.json` (ter os dois causava o erro *"Multiple versions of pnpm"* que deixou a CI vermelha).
>
> **Node 24 na CI (out/2026):** actions atualizadas para runtime Node 24 — `actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v6`. A versão do Node vem de `node-version-file: .nvmrc` (fonte única, `24`), junto com o `engines: ^24.0.0` do `package.json` raiz. As antigas `@v4` declaravam `node20` e o GitHub passou a forçá-las em Node 24 com aviso de deprecation.

### Estrutura DevOps

```
DevOps/
+-- README.md                    # Guia completo de deploy
+-- frontend/
¦   +-- vercel.json              # Cópia de referência (o ativo é apps/frontend/vercel.json)
¦   +-- .vercelignore            # Arquivos ignorados
+-- backend/
¦   +-- Dockerfile               # Container (alternativa)
¦   +-- railway.json             # Deploy Railway (alternativa)
¦   +-- render.yaml              # Deploy Render (alternativa)
+-- github-actions/
¦   +-- ci.yml                   # Pipeline CI/CD
+-- env/
    +-- .env.frontend.example    # Vars frontend
    +-- .env.backend.example     # Vars backend
```

---

## 15. Imagens

| Arquivo | Dimensoes | Uso |
|---------|-----------|-----|
| `banner-meteor.jpg` | Variavel | Banner em todas as paginas via PageBanner |
| `CapaMeteor.jpg` | 3328x1248 | Imagem de capa original (backup) |

---

## Anexo A — Correcao de Erros de Build (SSR)

### Problema
Componentes que usam Leaflet (mapas) causam `ReferenceError: window is not defined` durante `next build` porque o Leaflet depende de APIs do navegador que nao existem no servidor Node.js.

### Solucao
Usar `next/dynamic` com `{ ssr: false }` para importar componentes que dependem de APIs do navegador:

```tsx
// ANTES (causa erro no build)
import { CommerceMap } from './CommerceMap';

// DEPOIS (correto)
import dynamic from 'next/dynamic';
const CommerceMap = dynamic(() => import('./CommerceMap').then(mod => mod.CommerceMap), { ssr: false });
```

### Componentes Protegidos
| Pagina | Componente | Arquivo |
|--------|------------|---------|
| `/comercio` | CommerceMap | `comercio/page.tsx` |
| `/swell` | SpotsMap | `swell/page.tsx` |
| `/noticias` | TrafficMap | `noticias/page.tsx` |
| `/meteorologia` | NumericaTab | `meteorologia/page.tsx` |
| `/meteorologia` | WeatherMapDetail | `meteorologia/components/PrevisaoTab.tsx` |

### Regra
**TODO** componente que importa `leaflet` ou usa `window` deve ser importado via `next/dynamic` com `{ ssr: false }`.

---

## Anexo B — Configuracao Vercel MCP

### O que e
O Vercel MCP (Model Context Protocol) e um servidor remoto que permite a ferramentas de IA (Claude, Cursor, VS Code) interagir com projetos no Vercel.

### Configuracao
Arquivo: `~/.config/opencode/opencode.jsonc`

```json
{
  "mcpServers": {
    "vercel": {
      "url": "https://mcp.vercel.com"
    }
  }
}
```

### Tools Disponiveis
| Tool | Descricao |
|------|-----------|
| `search_docs` | Busca na documentacao oficial do Vercel |
| `get_deployment_logs` | Logs de deploys que falharam |
| `fetch_teams` | Lista times vinculados a conta |
| `fetch_projects` | Lista projetos do Vercel |

### Autenticacao
- OAuth: na primeira uso, segue o link para autenticar a conta do Vercel
- Clientes suportados: Claude, Cursor, VS Code
