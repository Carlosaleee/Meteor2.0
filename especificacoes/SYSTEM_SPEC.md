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
- Mapas: Leaflet nativo (useRef + cleanup pattern)
- Hooks: useMeteorology, useSwell
- API Layer: lib/api.ts com fetch generico
- Icones: React Icons (Font Awesome)
- Acessibilidade: skip-link, aria-label, aria-current, aria-expanded, role, focus-visible

---

## 3. Paginas Implementadas (8 rotas)

| Rota | Descricao | Dados |
|------|-----------|-------|
| `/` | Portal principal - HUD Tatico | Estatico + ChatWidget |
| `/meteorologia` | Meteorologia & Vento | **API real** (4 cidades) |
| `/swell` | Swell & Picos | **API real** |
| `/transito` | Transito & Mobilidade | Simulacao inteligente |
| `/noticias` | Noticias Regionais | Estatico (8 noticias) |
| `/blog` | Blog Tecnico | Estatico (4 artigos) |
| `/creditos` | Creditos & Fontes | Estatico |
| `/mapa` | Mapa de Localizacoes | Leaflet (6 marcadores) |

---

## 4. Backend — Modulos

### 4.1 MeteorologyModule
- Endpoint: GET /v1/meteorology?locationId=
- API externa: Open-Meteo Forecast (gratuita, sem chave)
- Fallback: data/fallback-meteorology.json (atualizado a cada 24h)
- Localizacoes: Ilha Comprida, Iguape, Cananeia, Registro

### 4.2 OceanographyModule
- Endpoint: GET /v1/oceanography
- API externa: Open-Meteo Marine (gratuita, sem chave)
- Fallback: data/fallback-oceanography.json
- Dados: ondas, swell, marees, qualidade, spots de surf

### 4.3 TrafficModule
- Endpoint: GET /v1/traffic
- API externa: Nenhuma (simulacao baseada em horario)
- Fallback: data/fallback-traffic.json
- Rodovias: SP-222, BR-116, Balsa Cananeia

### 4.4 FallbackService (Global)
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

### Definidas (para uso futuro)
| Variavel | Default | Modulo futuro |
|----------|---------|---------------|
| GEMINI_API_KEY | (vazio) | AiSummaryModule |
| GEMINI_MODEL | gemini-2.5-flash | AiSummaryModule |
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
- data/fallback-meteorology.json — Dados por localizacao
- data/fallback-oceanography.json — Ondas, swell, marees, spots
- data/fallback-traffic.json — Rodovias com simulacao por horario

---

## 7. Stack Tecnologica

### Frontend
- Next.js 15.4 (App Router)
- React 19.1
- TypeScript 5.9
- Tailwind CSS v4
- Leaflet 1.9 (mapas)
- React Icons 5.7 (icones Font Awesome)
- Vitest (testes)

### Backend
- NestJS 11.1
- Node.js + Express
- TypeScript 5.9
- Zod (validacao)
- Helmet (seguranca)
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
          oceanography/ (controller, service, repository)
          traffic/ (controller, service, repository)
        app.module.ts
        main.ts
      data/ (fallback JSONs - gitignored)
    frontend/
      src/
        app/ (8 paginas)
        components/ (Header, Footer, ChatWidget, maps)
        hooks/ (useMeteorology, useSwell)
        lib/api.ts
        app/globals.css (CSS custom properties + temas)
      public/
        CapaMeteor.jpg (imagem de capa 3328x1248)
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
- Imagem de capa `CapaMeteor.jpg` (3328x1248) com `object-contain` (tamanho real)
- Overlay gradiente `from-blue-900/90 via-header-bg/80 to-header-bg/90`
- Botoes de toggle: idioma (PT-BR/ES) e tema (Claro/Escuro)
- Linha dourada `bg-[var(--color-gold-line)]` entre hero e nav
- Icones: React Icons (FaGlobe, FaSun, FaMoon)

### Nav Bar (Responsiva)
- **Desktop (md+):** `hidden md:flex` — horizontal centrado com 8 itens
- **Mobile:** Hamburger (`FaBars`/`FaTimes`) com dropdown vertical
- Pagina ativa: borda dourada `border-b-2` (desktop) / `border-l-2` (mobile)
- Hover dourado: `hover:bg-nav-hover-bg hover:text-nav-hover-text`
- Fecha automaticamente ao navegar (`useEffect` com `pathname`)
- Acessibilidade: `aria-expanded`, `aria-controls`, `aria-current="page"`

### Footer (4 Colunas)
- **Coluna 1 — Branding:** Nome do projeto, descricao, copyright, licenca MIT
- **Coluna 2 — Desenvolvedor:** Carlos Alexandre (Full Stack Developer) + link GitHub
- **Coluna 3 — Fontes de Dados:** Open-Meteo, INMET, OpenStreetMap, Leaflet
- **Coluna 4 — Stack Tecnologica:** Next.js 15, NestJS, Tailwind CSS, Leaflet, TypeScript
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
