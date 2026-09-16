# Meteor 2.0 — Tactical HUD & Regional Intelligence Hub

Dashboard tático e central de inteligência regional focado na região de **Ilha Comprida e Vale do Ribeira**. O sistema atua como um orquestrador avançado de dados, agregando em tempo real informações meteorológicas, oceanográficas, de mobilidade urbana (trânsito), notícias cotidianas locais, comércio regional e resumos executivos gerados por Inteligência Artificial. Inclui o agente conversacional **Irons**, inspirado no lendário surfista Andy Irons.

---

## Arquitetura e Stack

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

### Backend (API & Orquestração)
* **Framework:** NestJS 11 + Express
* **Padrão Arquitetural:** Controller → Service → Repository (3 camadas)
* **Módulos:** Meteorology, Oceanography, Traffic, NotíciasRegionais, Comércio, **Iron** (agente IA)
* **Resiliência:** FallbackService com JSONs diários + cache
* **Segurança:** Helmet, CORS, Throttler (30 req/min)
* **Validação:** Zod (env schema + pipes)
* **Testes:** Jest (39+ testes)

### Frontend (Interface & Visualização)
* **Framework:** Next.js 15 (App Router) + React 19
* **Hooks:** useMeteorology, useSwell, useHourlyMarine, useAiSummary, useAllCities, useRegionalNews, **useComercio**
* **Mapas:** Leaflet (points, trânsito, comércio, radar RainViewer)
* **Gráficos:** ApexCharts (ondas, marés)
* **Ícones:** React Icons (Font Awesome)
* **Estilização:** Tailwind CSS v4 (dark/light theme)
* **Testes:** Vitest + React Testing Library (13+ testes)

---

## Ecossistema de Fontes de Dados

| Categoria | Fonte | Dados |
|-----------|-------|-------|
| **Meteorologia** | Open-Meteo Forecast | Temperatura, vento, chuva, UV (4 cidades) |
| **Meteorologia** | INMET | Avisos meteorológicos oficiais |
| **Meteorologia** | RainViewer | Radar de precipitação em tempo real |
| **Meteorologia** | CPTEC/INPE | Previsão numérica brasileira |
| **Oceanografia** | Open-Meteo Marine | Ondas, swell, período, direção |
| **Oceanografia** | **Gemini 2.5 Flash** | Briefing tático de surf (resumo IA) |
| **Trânsito** | Simulação local | Rodovias SP-222, BR-116, Balsa Cananeia |
| **Notícias** | Dados regionais | 12 notícias do Vale do Ribeira |
| **Comércio** | Dados locais | 50 estabelecimentos de Ilha Comprida |
| **IA** | **Gemini 2.5 Flash** | Resumos executivos + Irons Agent |

---

## 🤖 Irons Agent

Agente conversacional inteligente que integra todos os módulos do sistema para responder perguntas sobre a região.

**Endpoint:** `POST /v1/iron/chat`

**Capacidades:**
- Dados meteorológicos em tempo real
- Condições de ondas e surf
- Status de trânsito regional
- Diretório comercial de Ilha Comprida
- Notícias regionais atualizadas

**Exemplo de Request:**
```json
{
  "message": "Como está o swell em Ilha Comprida hoje?",
  "context": {}
}
```

**Integrações:**
- MeteorologyService (Open-Meteo)
- OceanographyService (Open-Meteo Marine + Gemini)
- TrafficService (simulação)
- ComercioService (diretório comercial)
- NoticiasRegionaisService (notícias regionais)

---

## 🧪 Cobertura de Testes

### Backend (Jest)
| Módulo | Arquivo | Testes | Status |
|--------|---------|--------|--------|
| Iron | iron.service.spec.ts | 9 | ✅ |
| Meteorologia | meteorology.service.spec.ts | 5 | ✅ |
| Gemini | gemini.repository.spec.ts | 4 | ✅ |
| Trânsito | traffic.service.spec.ts | 4 | ✅ |
| Notícias | noticias-regionais.service.spec.ts | 4 | ✅ |
| Comércio | comercio.service.spec.ts | 4 | ✅ |
| Fallback | fallback.service.spec.ts | 3 | ✅ |
| Health | api-health.spec.ts | 2 | ✅ |
| Oceanografia | oceanography.service.spec.ts | 4 | ⏭️ Skip |

### Frontend (Vitest + RTL)
| Componente | Arquivo | Testes | Status |
|------------|---------|--------|--------|
| ResumoIA | ResumoIA.test.tsx | 4 | ✅ |
| ChatWidget | ChatWidget.test.tsx | 3 | ✅ |
| Footer | Footer.test.tsx | 3 | ✅ |
| useComercio | useComercio.test.ts | 3 | ✅ |

**Total: 52 testes (45 passam, 4 pulam timeout)**

---

## Estrutura do Monorepo

```
Meteor_2.0/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── common/        # FallbackService, HTTP helpers, config
│   │   │   ├── modules/
│   │   │   │   ├── meteorology/      # Open-Meteo Forecast
│   │   │   │   ├── oceanography/     # Open-Meteo Marine + Gemini AI
│   │   │   │   ├── traffic/          # Simulação de trânsito
│   │   │   │   ├── noticias-regionais/ # Notícias do Vale do Ribeira
│   │   │   │   ├── comercio/         # Diretório comercial Ilha Comprida
│   │   │   │   └── iron/             # Agente IA conversacional
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── data/               # JSONs de fallback
│   └── frontend/
│       └── src/
│           ├── app/            # 9 rotas (Next.js App Router)
│           ├── components/     # Header, Footer, ChatWidget, PageBanner
│           ├── hooks/          # useMeteorology, useSwell, useComercio...
│           └── lib/            # api.ts, irons-knowledge.ts (RAG)
├── especificacoes/             # Documentação técnica
├── DESIGN.md                   # Paleta, tipografia, componentes
├── package.json                # Scripts: dev, test, predev
└── .env                        # GEMINI_API_KEY configurada
```

---

## Instalação e Execução

### Pré-requisitos
* Node.js >= 22
* pnpm 11 (`corepack enable && corepack prepare pnpm@11 --activate`)

### Configuração
```bash
cp .env.example .env
# Editar .env e adicionar GEMINI_API_KEY (formato AQ.)
```

### Instalação
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

| Cor | Código | Uso |
|-----|--------|-----|
| Graphite | `#2D3748` | Fundo principal |
| Gold | `#E0B429` | Destaques, botões, bordas |
| Orange | `#FF6A1A` | Alertas, CTAs |
| White | `#FFFFFF` | Texto principal |

---

## Licença

Distribuído sob a licença MIT © 2026 Carlos Alexandre.
