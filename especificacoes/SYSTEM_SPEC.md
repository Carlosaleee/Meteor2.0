# Especificacao Tecnica — Meteor 2.0

> **Ultima atualizacao:** 24/09/2026 (review completo: limpeza de codigo morto, 7 rotas, 136 testes)
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
- Seguranca: Helmet, CORS, Throttler (60 req/min, loopback isento)
- Validacao: Zod (env schema + pipes)
- Resiliencia: FallbackService com JSONs diarios
- **Automacao:** RefreshService com @nestjs/schedule (startup + cron 6h para dados pesados + cron 1h para rankings/noticias)

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
- API externa: Open-Meteo Forecast (gratuita, sem chave)
- Dados expandidos: current + hourly (24h) + daily (7 dias)
- Fallback: data/fallback-meteorology.json (atualizado a cada 24h)
- Localizacoes: Ilha Comprida, Iguape, Cananeia, Registro

### 4.2 OceanographyModule
- Endpoints:
  - GET /v1/oceanography — dados atuais (ondas, swell, qualidade, spots)
  - GET /v1/oceanography/hourly — previsao hourly 12h (wave_height, period, direction)
  - GET /v1/oceanography/summary — resumo tático gerado por Gemini AI
- API externa: Open-Meteo Marine (gratuita, sem chave)
- IA: Gemini 2.5 Flash (`@google/genai`) — briefing tático de surf
- Fallback: data/fallback-oceanography.json (inclui spots, tides, quality)
- Dados: ondas, swell, marees, qualidade, spots de surf, resumo IA
- Cache: resumo IA cacheado por 1h no backend

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
- API externa: WSL (worldsurfleague.com) + SPSurf (noticias de surf)
- Ranking WSL: parser de tabela HTML real (`<tr class="athlete-*">` → rank/nome/pais/pontos/trend; `<tr class="event-*">` → eventos com status; Upcoming primeiro) — fallback hardcoded se parse < 5 entradas
- Fallback: data/fallback-news.json (atualizado pelo RefreshService)
- Dados: rankings WSL (men/women/events), noticias de surf, calendario
- Repositories: news.repository (orquestador), wsl.repository, spsurf.repository (cache 30min com clearCache)

### 4.7 IronModule
- Endpoint: POST /v1/iron/chat
- Servico: Integracao com agente IA para respostas contextuais
- Modulos integrados: Meteorology, Oceanography, Traffic, Comercio, NoticiasRegionais
- IA: Gemini 2.5 Flash para processamento de mensagens
- Validacao: Zod schema para input do usuario
- Contexto: Coleta dados de todos os modulos e envia como contexto para Gemini

### 4.8 FallbackService (Global)
- Servico compartilhado entre todos os modulos
- Carrega fallback do disco de forma assincrona (fs.promises)
- Salva dados frescos quando API responde
- Verifica staleness (> 24h = stale)
- Fallback final: medias sazonais da regiao

### 4.9 RefreshService (Automacao)
- **Startup:** Executa refresh de todos os módulos ao iniciar (`onModuleInit`)
- **Cron pesado:** a cada 6 horas (`@Cron('0 */6 * * *')`) — meteorologia, oceanografia, weather news, rankings, noticias, regionais
- **Cron de noticias:** a cada 1 hora (`@Cron('0 * * * *')`) → `refreshNews()` — apenas rankings WSL + noticias + regionais (leve)
- **Modulos afetados:** Meteorologia, Oceanografia, Noticias (WSL + SPSurf), Noticias Regionais (RSS)
- **Endpoints:**
  - `GET /v1/cron/status` — Retorna ultimo refresh (`lastRefresh`, `lastNewsRefresh`) e status
  - `POST /v1/cron/refresh` — Forca refresh completo manual (autenticado via `CRON_SECRET`)
- **Metodos novos nos repositories:**
  - `open-meteo.repository.ts`: `forceRefresh(lat, lon)`
  - `marine.repository.ts`: `forceRefresh(lat, lon)`
  - `news.repository.ts`: `forceRefresh()`
  - `wsl.repository.ts`: `clearCache()`
  - `spsurf.repository.ts`: `clearCache()`
  - `noticias-regionais.repository.ts`: `forceRefresh()` (re-coleta RSS)

---

## 5. Variaveis de Ambiente

Schema validado com Zod em `apps/backend/src/common/config/env.schema.ts` (`parseEnv`).

### Ativamente usadas
| Variavel | Default | Descricao |
|----------|---------|-----------|
| PORT | 3001 | Porta do backend |
| FRONTEND_ORIGIN | http://localhost:3000 | CORS origin |
| FALLBACK_DIR | data | Diretorio dos JSONs de fallback |
| FALLBACK_MAX_AGE_HOURS | 24 | Idade maxima do fallback |
| NEXT_PUBLIC_API_URL | http://localhost:3001 | URL da API no frontend (frontend) |

### Definidas (em uso)
| Variavel | Default | Modulo |
|----------|---------|--------|
| NODE_ENV | development | Enum: development/test/production (validada no schema; lida pelo tooling) |
| GEMINI_API_KEY | (vazio) | OceanographyModule (resumo IA) + IronModule |
| GEMINI_MODEL | gemini-2.5-flash | OceanographyModule / IronModule |
| GEMINI_TEMPERATURE | 0.7 | OceanographyModule |
| GEMINI_API_BASE_URL | generativelanguage.googleapis.com | Declarada no schema (o SDK usa a URL padrao) |
| STORMGLASS_API_KEY | (vazio) | Reservada (Oceanografia avancada) |
| INMET_API_TOKEN | (vazio) | Reservada |
| INMET_BASE_URL | apitempo.inmet.gov.br | Declarada no schema (weather-news.repository usa URL direta) |
| GITHUB_TOKEN | (vazio) | Consumida apenas pelo MCP local (`.opencode/mcp/github-server.mjs`) |
| CRON_SECRET | meteor-refresh-secret | RefreshService (auth do endpoint) — lida via `process.env` cru, fora do schema Zod |

> **[LLM_CONTEXT] Migracao das Chaves Gemini API (Set/2026)**
> - Formato antigo (descontinuado): `AIzaSy...`
> - Formato novo (recomendado): `AQ.SUA_CHAVE_AQUI` — obter em https://aistudio.google.com/apikey
> - O SDK `@google/genai` aceita ambos os formatos (mudanca transparente para o codigo)
> - Endpoints que usam Gemini: `GET /v1/oceanography/summary` e `POST /v1/iron/chat`

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
- data/fallback-traffic.json — Rodovias com simulacao por horario
- data/fallback-comercio.json — 50 comercios de Ilha Comprida
- data/fallback-noticias-regionais.json — rolling 30 noticias regionais (RSS auto) + 5 rotas de transito
- data/fallback-news.json — Noticias WSL + SPSurf
- data/fallback-weather-news.json — Criado em runtime pelo weather-news.repository (pode nao existir em clone novo)

**Automacao de refresh:**
- Startup: todos os dados sao atualizados ao iniciar o backend
- Cron: a cada 6 horas (dados pesados) + a cada 1 hora (rankings WSL + noticias + regionais) via @nestjs/schedule
- Manual: `POST /v1/cron/refresh` com header `x-cron-secret`

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
- @nestjs/throttler ^6.7.0 (rate limit 60 req/min)
- @nestjs/schedule ^12.0.2 (crons 1h/6h)
- Node.js + Express
- TypeScript 5.9
- Zod (validacao)
- Helmet (seguranca)
- @google/genai (Gemini AI — resumo tatico)
- Jest 30.5 (testes — requer `--experimental-vm-modules` p/ Nest 12 ESM)

### Infra
- pnpm 11.10 (monorepo)
- Node 22 (CI) / 24+ (dev local)
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

**Branches ativas:**
| Branch | Descricao |
|--------|-----------|
| `main` | Producao, todas as features mergeadas |

---

## 9. Cobertura de Testes

**Total: 136 testes (136 passam) — backend Jest 30 (99) + frontend Vitest (37)**

### Backend (Jest) — 99 testes em 20 arquivos
| Arquivo | Testes | Status |
|---------|--------|--------|
| refresh.service.spec.ts | 15 | ✅ |
| noticias-regionais.repository.spec.ts | 11 | ✅ (RSS com mock) |
| wsl.repository.spec.ts | 7 | ✅ (fixture WSL real) |
| gemini-chat.repository.spec.ts | 6 | ✅ |
| iron.service.spec.ts | 6 | ✅ |
| meteorology.controller.spec.ts | 5 | ✅ |
| meteorology.service.spec.ts | 5 | ✅ |
| weather-news.repository.spec.ts | 5 | ✅ |
| comercio.service.spec.ts | 4 | ✅ |
| cron.controller.spec.ts | 4 | ✅ |
| gemini.repository.spec.ts | 4 | ✅ |
| news.service.spec.ts | 4 | ✅ |
| noticias-regionais.service.spec.ts | 4 | ✅ |
| oceanography.service.spec.ts | 4 | ✅ |
| spsurf.repository.spec.ts | 4 | ✅ |
| traffic.service.spec.ts | 4 | ✅ |
| api-health.spec.ts | 2 | ✅ |
| envelope.interceptor.spec.ts | 2 | ✅ |
| fallback.service.spec.ts | 2 | ✅ |
| http-exception.filter.spec.ts | 1 | ✅ |

### Frontend (Vitest + RTL) — 37 testes em 9 arquivos
| Arquivo | Testes | Status |
|---------|--------|--------|
| ChatWidget.test.tsx | 8 | ✅ (corrigido: ChatProvider wrapper) |
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
          config/ (env.schema.ts, locations.ts — apenas SURF_CENTER)
          fallback/fallback.service.ts
          http/ (api-envelope, envelope.interceptor, http-exception.filter + specs)
          refresh/ (refresh.service, refresh.module, cron.controller)
        modules/
          meteorology/ (controller, service, repository)
          oceanography/ (controller, service, marine.repository, gemini.repository)
          traffic/ (controller, service, repository)
          noticias-regionais/ (controller, service, repository)
          comercio/ (controller, service, repository)
          iron/ (controller, service, gemini-chat.repository)
          news/ (controller, service, wsl.repository, spsurf.repository)
        app.module.ts
        main.ts
      data/ (fallback JSONs)
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
          ChatWidget.tsx + ChatContext.tsx (bot flutuante)
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
- **Gemini 2.5 Flash:** Resumo tático de surf (briefing com 5 tópicos)
- **Leaflet + OpenStreetMap:** Mapa de picos de surf
- **Unsplash:** Imagens de notícias (thumbnails)

---

## 14. Deploy em Produção

### URLs de Produção

| Serviço | URL |
|---------|-----|
| Frontend | `https://meteor2-0-frontend.vercel.app` |
| Backend | `https://meteor2-0-backend.vercel.app` |
| Health Check | `https://meteor2-0-backend.vercel.app/health` |

### Plataformas

| App | Plataforma | Tipo |
|-----|-----------|------|
| Frontend (Next.js) | Vercel | Serverless (static + ISR) |
| Backend (NestJS) | Vercel | Serverless (API routes) |

### Variáveis de Ambiente (Produção)

#### Frontend (Vercel)
| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://meteor2-0-backend.vercel.app` | URL da API backend (bundled no JS) |

Configurado em: `apps/frontend/.env.production`

#### Backend (Vercel)
| Variável | Valor | Descrição |
|----------|-------|-----------|
| `FRONTEND_ORIGIN` | `https://meteor2-0-frontend.vercel.app` | CORS origin |
| `GEMINI_API_KEY` | *(chave secreta — formato AQ... desde Set/2026)* | API Gemini para resumo IA |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Modelo Gemini |
| `GEMINI_TEMPERATURE` | `0.7` | Temperatura Gemini |
| `FALLBACK_DIR` | `data` | Diretório de fallback |

### CI/CD (GitHub Actions)

Pipeline em `.github/workflows/ci.yml`:

| Job | Descrição | Trigger |
|-----|-----------|---------|
| `backend-test` | Jest (99 testes) | push/PR |
| `frontend-test` | Vitest (37 testes) | push/PR |
| `lint` | oxlint (frontend) | push/PR |
| `build` | Valida compilação | Após testes |

### Estrutura DevOps

```
DevOps/
+-- README.md                    # Guia completo de deploy
+-- frontend/
¦   +-- vercel.json              # Config Vercel (monorepo)
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
