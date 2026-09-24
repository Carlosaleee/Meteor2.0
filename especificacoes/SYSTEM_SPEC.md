# Especificacao Tecnica — Meteor 2.0

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

## 3. Paginas Implementadas (9 rotas)

| Rota | Descricao | Dados |
|------|-----------|-------|
| `/` | Portal principal - HUD Tatico | Estatico + ChatWidget + banner |
| `/meteorologia` | Previsão do Tempo & Vento | **API real** (4 cidades) + RainViewer radar + PageBanner |
| `/swell` | Swell & Points | **API real** + Gemini AI + ApexCharts + Leaflet |
| `/noticias` | Noticias Regionais + Transito | **RSS auto-atualizado** (ISN + Santa Portal + Google News) + TrafficMap Leaflet + CityGrid |
| `/comercio` | Comercio de Ilha Comprida | **API real** (fallback-comercio) + CommerceMap Leaflet + OSRM routing |
| `/transito` | Transito Regional | Marcadores estaticos + BaseLeafletMap Leaflet (SP-222, BR-116, Balsa) |
| `/blog` | Blog Tecnico | Estatico (4 artigos) |
| `/creditos` | Creditos & Fontes | Estatico |
| `/mapa` | Mapa de Localizacoes | Leaflet (6 marcadores) |

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
- Endpoint: GET /v1/noticias-regionais
- API externa: RSS automatico — ISN Online (isnonline.com.br/feed), Santa Portal (santaportal.com.br/feed), Google News RSS ("Vale do Ribeira")
- Fallback: data/fallback-noticias-regionais.json (merge: RSS fresco + base, rolling 30 noticias + 5 rotas)
- Dados: noticias regionais do Vale do Ribeira (categorias: transito/policial/turismo/cotidiano/noticia por keyword) + status de rodovias (rotas estaticas)
- Cache: 30min em memoria; `forceRefresh()` re-coleta todos os feeds (cron 1h + a cada 6h)

### 4.5 ComercioModule
- Endpoint: GET /v1/comercio
- API externa: Nenhuma (dados estaticos)
- Fallback: data/fallback-localismo.json (50 comercios de Ilha Comprida)
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

### Ativamente usadas
| Variavel | Default | Descricao |
|----------|---------|-----------|
| PORT | 3001 | Porta do backend |
| FRONTEND_ORIGIN | http://localhost:3000 | CORS origin |
| FALLBACK_DIR | data | Diretorio dos JSONs de fallback |
| FALLBACK_MAX_AGE_HOURS | 24 | Idade maxima do fallback |
| NEXT_PUBLIC_API_URL | http://localhost:3001 | URL da API no frontend |

### Definidas (em uso)
| Variavel | Default | Modulo |
|----------|---------|--------|
| GEMINI_API_KEY | (vazio) | OceanographyModule (resumo IA) |
| GEMINI_MODEL | gemini-2.5-flash | OceanographyModule |
| GEMINI_TEMPERATURE | 0.7 | OceanographyModule |
| GEMINI_API_BASE_URL | generativelanguage.googleapis.com | OceanographyModule |
| STORMGLASS_API_KEY | (vazio) | Oceanografia avancada |
| INMET_API_TOKEN | (vazio) | Estacoes INMET |
| DATABASE_URL | file:./data/meteor.db | Drizzle ORM |
| CRON_SECRET | meteor-refresh-secret | RefreshService (auth do endpoint) |

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
- data/fallback-noticias-regionais.json — rolling 30 noticias regionais (RSS auto) + 5 rotas de transito
- data/fallback-news.json — Noticias WSL + SPSurf

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
- NestJS 12.1
- Node.js + Express
- TypeScript 5.9
- Zod (validacao)
- Helmet (seguranca)
- @google/genai (Gemini AI — resumo tatico)
- Jest 30 (testes — requer `--experimental-vm-modules` p/ Nest 12 ESM)

### Infra
- pnpm 11 (monorepo)
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

## 8.1 Correcao de Erros de Build (SSR)

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
| `/mapa` | SpotMap | `mapa/page.tsx` |
| `/transito` | BaseLeafletMap | `transito/page.tsx` |

### Regra
**TODO** componente que importa `leaflet` ou usa `window` deve ser importado via `next/dynamic` com `{ ssr: false }`.

---

## 8.2 Configuracao Vercel MCP

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

---

## 9. Cobertura de Testes

### Backend (Jest)
| Arquivo | Testes | Status |
|---------|--------|--------|
| iron.service.spec.ts | 11 | ✅ |
| meteorology.service.spec.ts | 5 | ✅ |
| oceanography.service.spec.ts | 4 | ✅ |
| gemini.repository.spec.ts | 4 | ✅ |
| gemini-chat.repository.spec.ts | 6 | ✅ |
| traffic.service.spec.ts | 4 | ✅ |
| noticias-regionais.service.spec.ts | 4 | ✅ |
| noticias-regionais.repository.spec.ts | 11 | ✅ (RSS com mock) |
| comercio.service.spec.ts | 4 | ✅ |
| news.service.spec.ts | 4 | ✅ |
| fallback.service.spec.ts | 3 | ✅ |
| meteorology.controller.spec.ts | 4 | ✅ |
| refresh.service.spec.ts | 15 | ✅ |
| cron.controller.spec.ts | 4 | ✅ |
| wsl.repository.spec.ts | 7 | ✅ (fixture WSL real) |
| spsurf.repository.spec.ts | 3 | ✅ |
| weather-news.repository.spec.ts | 5 | ✅ |
| api-health.spec.ts | 2 | ✅ |
| http-exception.filter.spec.ts | 3 | ✅ |
| envelope.interceptor.spec.ts | 3 | ✅ |

### Frontend (Vitest + RTL)
| Arquivo | Testes | Status |
|---------|--------|--------|
| ResumoIA.test.tsx | 6 | ✅ |
| ChatWidget.test.tsx | 8 | ✅ (corrigido: ChatProvider wrapper) |
| Footer.test.tsx | 3 | ✅ |
| useComercio.test.ts | 3 | ✅ |
| useWeatherNews.test.ts | 5 | ✅ |
| useMeteorology.test.ts | 3 | ✅ |
| useSwell.test.ts | 3 | ✅ |
| useAllCities.test.ts | 2 | ✅ |
| api.test.ts | 4 | ✅ |
| utils.test.ts | 11 | ✅ |

**Total: 147 testes (147 passam) — backend Jest 30 (99) + frontend Vitest (48)**

---

## 10. Estrutura de Diretorios

```
Meteor_2.0/
  apps/
    backend/
      src/
        common/
          config/env.schema.ts
          fallback/fallback.service.ts
          http/ (envelope, filter, pipe)
          refresh/ (refresh.service, refresh.module, cron.controller)
        modules/
          meteorology/ (controller, service, repository)
          oceanography/ (controller, service, marine.repository, gemini.repository)
          traffic/ (controller, service, repository)
          noticias-regionais/ (controller, service, repository)
          comercio/ (controller, service, repository)
          iron/ (controller, service, module)
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
            page.tsx (5 abas: Noticias, Ondas, Picos, Marees, Visao Geral)
            components/ (11 componentes + CommerceGrid compartilhado)
          noticias/
            page.tsx (PageBanner + TrafficMap + CityGrid + filtros + grid noticias)
            components/ (TrafficMap)
          comercio/
            page.tsx (PageBanner + CommerceMap + CommerceGrid)
            CommerceMap.tsx (Leaflet + OSRM routing)
          transito/page.tsx
          blog/page.tsx
          creditos/page.tsx
          mapa/page.tsx
          page.tsx (portal principal)
        components/
          Header.tsx (nav responsiva)
          Footer.tsx (4 colunas: Navegacao, Fontes, Stack, Chatbot)
          PageBanner.tsx (hero reutilizavel — banner-meteor.jpg)
          ChatWidget.tsx (bot flutuante)
        hooks/
          useMeteorology.ts
          useSwell.ts
          useHourlyMarine.ts (dados hourly 12h)
          useAiSummary.ts (resumo Gemini)
          useAllCities.ts (4 cidades paralelo)
          useRegionalNews.ts (noticias regionais + rotas)
          useComercio.ts (diretorio comercial)
        lib/api.ts
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
- **Coluna 1 — Navegacao:** 7 links internos (Previsão do Tempo, Swell, Transito, Noticias, Blog, Mapa, Creditos)
- **Coluna 2 — Fontes de Dados:** Open-Meteo, INMET, RainViewer, CPTEC/INPE, OpenStreetMap
- **Coluna 3 — Stack Tecnologica:** Next.js 15, NestJS, Tailwind CSS, Leaflet, TypeScript
- **Coluna 4 — Links Uteis:** Contatos de emergencia (PM 190, Bombeiros 193, SAMU 192, Defesa Civil 199, Hospital, Policia Rodoviaria 197)
- **Rodape:** "Meteor — Creditos de Desenvolvimento: Carlos Alexandre"
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
- **Hero:** Gradient blue com qualidade, melhor horário, botão Atualizar
- **KPI Cards:** 4 cards (Altura, Swell, Direção, Maré)
- **SwellTabs:** 5 abas (Notícias → Ondas → Points → Marés → Visão Geral)

### Abas e Conteúdo

#### Notícias (aba padrão)
- 10 notícias com imagens reais (Unsplash)
- Categorias: WSL, Paulista, Previsão, Alertas, ISA, Magazine, Global
- Grid responsivo: 1 coluna mobile, 2 tablet, 3 desktop
- Links externos para fontes oficiais

#### Ondas
- **WaveChart:** Gráfico ApexCharts área com 2 séries (Onda + Swell)
  - Legendas explicativas ("Onda = altura na praia" / "Swell = onda de origem")
  - Faixas de qualidade tracejadas (Clássico 1.5m, Boas 1.0m)
  - Tooltip detalhado: hora, altura, qualidade, período, direção
  - Altura: 350px
- **HourlySwell:** Grid responsivo 12 horas com classificação de qualidade

#### Points
- **SpotGrid:** Cards com filtros (Iniciante/Intermediário/Avançado) e busca
- **SwellMap:** Leaflet com 6 marcadores coloridos

#### Marés
- **TideChart:** Gráfico ApexCharts linha com annotations
  - Tabela de próximas 4 marés (Alta/Baixa)
  - Gradiente preenchido abaixo da curva
  - Tooltip com tipo e altura
  - Altura: 320px

#### Visão Geral
- **ResumoIA:** Briefing Gemini com tópicos (Ondas, Vento, Horários, Points, Alertas)
- **ConditionCards:** 5 mini cards (Onda, Swell, Período, Direção, Qualidade)
- **HourlySwell:** Grid 12 horas
- **DailyTip:** Dica prática + prancha recomendada

### Componentes (11 arquivos em swell/components/)
| Componente | Descrição |
|------------|-----------|
| SwellTabs.tsx | 5 abas com aria pattern |
| ResumoIA.tsx | Briefing Gemini com markdown |
| WaveChart.tsx | Gráfico ApexCharts área (ondas) |
| TideChart.tsx | Gráfico ApexCharts linha (marés) |
| SpotGrid.tsx | Cards de spots com filtros e busca |
| SurfNews.tsx | 10 notícias com imagens |
| HourlySwell.tsx | Grid responsivo 12h |
| ConditionCards.tsx | 5 mini cards de condições |
| DailyTip.tsx | Dica prática do dia |
| Skeletons.tsx | Loading states (6 tipos) |

### Hooks (9 hooks)
| Hook | Descricao |
|------|-----------|
| useMeteorology.ts | Busca GET /v1/meteorology |
| useSwell.ts | Busca GET /v1/oceanography |
| useHourlyMarine.ts | Busca GET /v1/oceanography/hourly |
| useAiSummary.ts | Busca GET /v1/oceanography/summary |
| useAllCities.ts | Busca 4 cidades em paralelo |
| useNews.ts | Busca noticias de surf |
| useWeatherNews.ts | Busca GET /v1/meteorology/news |
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
| `frontend-test` | Vitest (48 testes) | push/PR |
| `lint` | oxlint (frontend) | push/PR |
| `build` | Valida compilação | Após testes |

### Estrutura DevOps

```
DevOps/
├── README.md                    # Guia completo de deploy
├── frontend/
│   ├── vercel.json              # Config Vercel (monorepo)
│   └── .vercelignore            # Arquivos ignorados
├── backend/
│   ├── Dockerfile               # Container (alternativa)
│   ├── railway.json             # Deploy Railway (alternativa)
│   └── render.yaml              # Deploy Render (alternativa)
├── github-actions/
│   └── ci.yml                   # Pipeline CI/CD
└── env/
    ├── .env.frontend.example    # Vars frontend
    └── .env.backend.example     # Vars backend
```

---

## 15. Imagens

| Arquivo | Dimensoes | Uso |
|---------|-----------|-----|
| `banner-meteor.jpg` | Variavel | Banner em todas as paginas via PageBanner |
| `CapaMeteor.jpg` | 3328x1248 | Imagem de capa original (backup) |
