# Meteor 2.0 — Tactical HUD & Regional Intelligence Hub

> **Ultima atualizacao:** 24/09/2026 (review completo: limpeza de codigo morto, 7 rotas, 136 testes)
>
> **Documentos relacionados:** [especificacoes/SYSTEM_SPEC.md](./especificacoes/SYSTEM_SPEC.md) · [especificacoes/GUIA_DESENVOLVEDOR.md](./especificacoes/GUIA_DESENVOLVEDOR.md) · [especificacoes/REFERENCIA_API.md](./especificacoes/REFERENCIA_API.md) · [DESIGN.md](./DESIGN.md)

Dashboard tactico e central de inteligencia regional focado na regiao de **Ilha Comprida e Vale do Ribeira**. O sistema atua como um orquestrador avancado de dados, agregando em tempo real informacoes meteorologicas, oceanograficas, de mobilidade urbana (transito), noticias cotidianas locais, comercio regional e resumos executivos gerados por Inteligencia Artificial. Inclui o agente conversacional **Irons**, inspirado no lendario surfista Andy Irons.

---

## Arquitetura e Stack

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

### Backend (API & Orquestracao)
* **Framework:** NestJS 12 + Express
* **Padrao Arquitetural:** Controller > Service > Repository (3 camadas)
* **Modulos:** Meteorology, Oceanography, Traffic, NoticiasRegionais, Comercio, **News** (WSL/SPSurf), **Iron** (agente IA)
* **Resiliencia:** FallbackService com JSONs diarios + cache
* **Seguranca:** Helmet, CORS, Throttler (60 req/min — loopback isento)
* **Validacao:** Zod (env schema) + ApiEnvelope global (interceptor)
* **Testes:** Jest (99 testes em 20 arquivos `*.spec.ts`)

### Frontend (Interface & Visualizacao)
* **Framework:** Next.js 15 (App Router) + React 19
* **Hooks:** useMeteorology, useSwell, useHourlyMarine, useAiSummary, useAllCities, useRegionalNews, useComercio, useNews, useWeatherNews (9 hooks)
* **Mapas:** Leaflet (points, transito via /noticias, comercio, radar RainViewer)
* **Graficos:** ApexCharts (ondas, marés, vento)
* **Icones:** React Icons (Font Awesome)
* **Estilizacao:** Tailwind CSS v4 (dark/light theme)
* **Testes:** Vitest + React Testing Library (37 testes em 9 arquivos)

---

## Ecossistema de Fontes de Dados

| Categoria | Fonte | Dados |
|-----------|-------|-------|
| **Meteorologia** | Open-Meteo Forecast | Temperatura, vento, chuva, UV (4 cidades) |
| **Meteorologia** | INMET | Avisos meteorologicos oficiais |
| **Meteorologia** | RainViewer | Radar de precipitacao em tempo real |
| **Meteorologia** | CPTEC/INPE | Previsao numerica brasileira |
| **Oceanografia** | Open-Meteo Marine | Ondas, swell, periodo, direcao |
| **Oceanografia** | **Gemini 2.5 Flash** | Briefing tactico de surf (resumo IA) |
| **Transito** | Simulacao local | Rodovias SP-222, SP-165, BR-116, SP-055, Balsa Cananeia |
| **Noticias** | RSS automatico (ISN + Santa Portal + Google News) | 30 noticias do Vale do Ribeira (rolling) |
| **Surf** | WSL + SPSurf | 12 noticias, rankings WSL, eventos |
| **Comercio** | Dados locais | 50 estabelecimentos de Ilha Comprida |
| **IA** | **Gemini 2.5 Flash** | Resumos executivos + Irons Agent |

---

## Irons Agent

Agente conversacional inteligente que integra todos os modulos do sistema para responder perguntas sobre a regiao.

**Endpoint:** `POST /v1/iron/chat`

**Capacidades:**
- Dados meteorologicos em tempo real
- Condicoes de ondas e surf
- Status de transito regional
- Diretorio comercial de Ilha Comprida
- Noticias regionais e de surf atualizadas

**Exemplo de Request:**
```json
{
  "message": "Como esta o swell em Ilha Comprida hoje?",
  "context": {}
}
```

**Integracoes:**
- MeteorologyService (Open-Meteo + weather news)
- OceanographyService (Open-Meteo Marine + Gemini)
- TrafficService (simulacao)
- ComercioService (diretorio comercial)
- NoticiasRegionaisService (RSS regional)
- NewsRepository (WSL + SPSurf)

---

## Cobertura de Testes

**Total: 136 testes (136 passam) — backend Jest 99 + frontend Vitest 37**

| Suite | Runner | Testes | Arquivos |
|-------|--------|--------|----------|
| `apps/backend` | Jest 30.5 (`node --experimental-vm-modules`) | 99 | 20 `*.spec.ts` |
| `apps/frontend` | Vitest + RTL + jsdom | 37 | 9 `*.test.{ts,tsx}` |

Detalhamento por arquivo: [especificacoes/SYSTEM_SPEC.md §9](./especificacoes/SYSTEM_SPEC.md#9-cobertura-de-testes).

---

## Estrutura do Monorepo

```
Meteor_2.0/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── common/        # fallback, http (envelope), config (Zod), refresh (cron)
│   │   │   ├── modules/       # meteorology, oceanography, traffic,
│   │   │   │                  # noticias-regionais, comercio, news, iron
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── data/              # JSONs de fallback
│   └── frontend/
│       └── src/
│           ├── app/           # 7 rotas (Next.js App Router)
│           ├── components/    # Header, Footer, ChatWidget, PageBanner...
│           ├── hooks/         # 9 hooks + 5 arquivos de teste
│           └── lib/           # api.ts, spots-data.ts
├── especificacoes/            # Documentacao tecnica (SYSTEM_SPEC, GUIA, REFERENCIA_API)
├── DESIGN.md                  # Paleta, tipografia, componentes
├── package.json               # Scripts: dev, test, lint, build, format
└── .env                       # GEMINI_API_KEY configurada
```

---

## Instalacao e Execucao

### Pre-requisitos
* Node.js >= 22 (dev local: 24+)
* pnpm 11 (`corepack enable && corepack prepare pnpm@11 --activate`)

### Configuracao
```bash
cp .env.example .env
# Editar .env e adicionar GEMINI_API_KEY (formato AQ.)
```

### Instalacao
```bash
pnpm install
```

### Desenvolvimento
```bash
pnpm dev    # Inicia backend (3001) + frontend (3000)
```

### Testes
```bash
pnpm test                   # Todos os testes (backend + frontend)
pnpm --filter backend test  # Apenas backend
pnpm --filter frontend test # Apenas frontend
```

---

## Paleta de Cores

| Cor | Codigo | Uso |
|-----|--------|-----|
| Graphite | `#2D3748` | Fundo principal |
| Gold | `#E0B429` | Destaques, botoes, bordas |
| Orange | `#FF6A1A` | Alertas, CTAs |
| White | `#FFFFFF` | Texto principal |

---

## Licenca

Distribuido sob a licenca MIT © 2026 Carlos Alexandre.
