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
|      NestJS 11          |      Next.js 15         |
|      Porta 3001         |      Porta 3000         |
+-------------------------+-------------------------+
|                  pnpm-workspace.yaml               |
+---------------------------------------------------+
```

### Backend (NestJS)
- Padrao arquitetural: Controller > Service > Repository (3 camadas)
- Seguranca: Helmet, CORS, Throttler (30 req/min)
- Validacao: Zod (env schema + pipes)
- Resiliencia: FallbackService com JSONs diarios

### Frontend (Next.js 15)
- App Router com React 19
- Estilizacao: Tailwind CSS v4 (design tokens via CSS custom properties)
- Tema: dark/light com `data-theme` + `localStorage` + `prefers-color-scheme`
- Mapas: Leaflet nativo (useRef + cleanup pattern) — tiles OpenStreetMap (gratuitos, sem API key)
- Hooks: useMeteorology, useSwell, useHourlyMarine, useAiSummary, useAllCities, useRegionalNews, useLocalismo
- API Layer: lib/api.ts com fetch generico
- Icones: React Icons (Font Awesome)
- Graficos: ApexCharts (react-apexcharts)
- Acessibilidade: skip-link, aria-label, aria-current, aria-expanded, role, focus-visible, title tooltips

---

## 3. Paginas Implementadas (9 rotas)

| Rota | Descricao | Dados |
|------|-----------|-------|
| `/` | Portal principal - HUD Tatico | Estatico + ChatWidget + banner |
| `/meteorologia` | Meteorologia & Vento | **API real** (4 cidades) + RainViewer radar + PageBanner |
| `/swell` | Swell & Picos | **API real** + Gemini AI + ApexCharts + Leaflet |
| `/noticias` | Noticias Regionais + Transito | **API real** (fallback-noticias-regionais) + TrafficMap Leaflet + CityGrid |
| `/comercio` | Comercio de Ilha Comprida | **API real** (fallback-localismo) + CommerceMap Leaflet + OSRM routing |
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
- API externa: Nenhuma (dados estaticos)
- Fallback: data/fallback-noticias-regionais.json (12 noticias + 4 rotas)
- Dados: noticias regionais do Vale do Ribeira + status de rodovias

### 4.5 LocalismoModule
- Endpoint: GET /v1/localismo
- API externa: Nenhuma (dados estaticos)
- Fallback: data/fallback-localismo.json (50 comercios de Ilha Comprida)
- Dados: diretorio comercial com geolocalizacao (5 setores: alimentacao, hospedagem, comercio, servicos, lazer)

### 4.6 FallbackService (Global)
- Servico compartilhado entre todos os modulos
- Carrega fallback do disco na inicializacao
- Salva dados frescos quando API responde
- Verifica staleness (> 24h = stale)
- Fallback final: medias sazonais da regiao

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
- data/fallback-noticias-regionais.json — 12 noticias regionais + 4 rotas de transito
- data/fallback-localismo.json — 50 comercios de Ilha Comprida (formato FallbackData envelope)

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
- NestJS 11.1
- Node.js + Express
- TypeScript 5.9
- Zod (validacao)
- Helmet (seguranca)
- @google/genai (Gemini AI — resumo tatico)
- Jest (testes)

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
| `feature/swell-styling` | Redesign completo da pagina Swell |

---

## 9. Estrutura de Diretorios

```
Meteor_2.0/
  apps/
    backend/
      src/
        common/
          config/env.schema.ts
          fallback/fallback.service.ts
          http/ (envelope, filter, pipe)
        modules/
          meteorology/ (controller, service, repository)
          oceanography/ (controller, service, marine.repository, gemini.repository)
          traffic/ (controller, service, repository)
          noticias-regionais/ (controller, service, repository)
          localismo/ (controller, service, repository)
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
          useLocalismo.ts (diretorio comercial)
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

## 10. UI/UX — Header, Footer, Nav

### Header
- Logo "Meteor" com icone FaWater
- Linha dourada `bg-[var(--color-gold-line)]` entre hero e nav
- Toggle tema: FaSun/FaMoon
- Nav responsiva: horizontal desktop, hamburger mobile

### Nav Bar (Responsiva)
- **Desktop (md+):** `hidden md:flex` — horizontal centrado com 7 itens
- **Mobile:** Hamburger (`FaBars`/`FaTimes`) com dropdown vertical
- **Ordem:** Principal > Meteorologia > Swell > Noticias > Comercio > Blog > Creditos
- Pagina ativa: borda dourada `border-b-2` (desktop) / `border-l-2` (mobile)
- Hover dourado: `hover:bg-nav-hover-bg hover:text-nav-hover-text`
- Fecha automaticamente ao navegar (`useEffect` com `pathname`)
- Acessibilidade: `aria-expanded`, `aria-controls`, `aria-current="page"`

### Footer (4 Colunas — Layout Atualizado)
- **Linha 1:** "METEOR 2.0" centralizado em dourado + descricao do projeto
- **Coluna 1 — Navegacao:** 7 links internos (Meteorologia, Swell, Transito, Noticias, Blog, Mapa, Creditos)
- **Coluna 2 — Fontes de Dados:** Open-Meteo, INMET, RainViewer, CPTEC/INPE, OpenStreetMap
- **Coluna 3 — Stack Tecnologica:** Next.js 15, NestJS, Tailwind CSS, Leaflet, TypeScript
- **Coluna 4 — Assistente IA:** Card MeteorBot IA com mini chat integrado
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

## 11. Pagina de Meteorologia (Detalhes)

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

### Acessibilidade (Meteorologia)
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

## 12. Pagina de Swell (Detalhes)

### Estrutura Principal
- **Container:** `<div className="space-y-8">` com PageBanner + Hero + Tabs + Conteudo
- **Hero:** Gradient blue com qualidade, melhor horário, botão Atualizar
- **KPI Cards:** 4 cards (Altura, Swell, Direção, Maré)
- **SwellTabs:** 5 abas (Notícias → Ondas → Picos → Marés → Visão Geral)

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

#### Picos
- **SpotGrid:** Cards com filtros (Iniciante/Intermediário/Avançado) e busca
- **SwellMap:** Leaflet com 6 marcadores coloridos

#### Marés
- **TideChart:** Gráfico ApexCharts linha com annotations
  - Tabela de próximas 4 marés (Alta/Baixa)
  - Gradiente preenchido abaixo da curva
  - Tooltip com tipo e altura
  - Altura: 320px

#### Visão Geral
- **ResumoIA:** Briefing Gemini com tópicos (Ondas, Vento, Horários, Picos, Alertas)
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

### Hooks (8 hooks)
| Hook | Descricao |
|------|-----------|
| useMeteorology.ts | Busca GET /v1/meteorology |
| useSwell.ts | Busca GET /v1/oceanography |
| useHourlyMarine.ts | Busca GET /v1/oceanography/hourly |
| useAiSummary.ts | Busca GET /v1/oceanography/summary |
| useAllCities.ts | Busca 4 cidades em paralelo |
| useNews.ts | Busca noticias de surf |
| useRegionalNews.ts | Busca GET /v1/noticias-regionais |
| useLocalismo.ts | Busca GET /v1/localismo |

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

## 13. Imagens

| Arquivo | Dimensoes | Uso |
|---------|-----------|-----|
| `banner-meteor.jpg` | Variavel | Banner em todas as paginas via PageBanner |
| `CapaMeteor.jpg` | 3328x1248 | Imagem de capa original (backup) |
