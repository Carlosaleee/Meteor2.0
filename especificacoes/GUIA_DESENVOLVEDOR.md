# Guia do Desenvolvedor — Meteor 2.0

## Pre-requisitos

- Node.js 20+ (recomendado: 22 LTS)
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
cd apps/backend
npm run dev
# Acessa em http://localhost:3001
# Health check: http://localhost:3001/health
```

### Frontend (Terminal 2)
```bash
cd apps/frontend
npm run dev
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

# Formatacao
pnpm format
```

## Estrutura do Projeto

```
Meteor_2.0/
  apps/
    backend/           # API NestJS
      src/
        common/        # Servicos compartilhados (fallback, http, config, refresh)
        modules/       # Modulos de dominio (meteorology, oceanography, traffic, noticias-regionais, comercio, iron)
        data/          # JSONs de fallback
    frontend/          # App Next.js
      src/
        app/           # Paginas (9 rotas)
          meteorologia/
            page.tsx   # PageBanner + cards temperatura + Tabs
            components/ # 13 componentes
          swell/           # 5 abas + 11 componentes
            page.tsx
            components/
          noticias/        # Noticias regionais + TrafficMap + CityGrid
            page.tsx
            components/    # TrafficMap
          comercio/        # Comercio de Ilha Comprida + CommerceMap
            page.tsx
            CommerceMap.tsx
          transito/
          blog/
          creditos/
          mapa/
        components/    # Componentes reutilizaveis
          Header.tsx   # Nav responsiva (7 itens)
          Footer.tsx   # 4 colunas com chatbot
          PageBanner.tsx # Hero reutilizavel (banner-meteor.jpg)
        hooks/         # Hooks customizados (8 hooks)
        lib/           # Utilitarios (api.ts)
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
- **RefreshService:** automacao de refresh (startup + cron 6h)

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

### Backend (.env)
```
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
FALLBACK_DIR=data
FALLBACK_MAX_AGE_HOURS=24
CRON_SECRET=meteor-refresh-secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend
- Logs aparecem no terminal do `npm run dev`
- Erros retornam no formato ApiEnvelope: `{ success, data, error }`
- Health check: `GET /health`

### Frontend
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

### Fallbacks sempre retornando dados antigos
- Verificar se `apps/backend/data/` existe
- Os JSONs sao criados automaticamente na primeira requisicao bem-sucedida

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

### RefreshService nao atualiza dados
**Causa:** Endpoint de refresh nao configurado ou CRON_SECRET incorreto.

**Verificacoes:**
1. Verificar se `@nestjs/schedule` esta instalado: `npm ls @nestjs/schedule`
2. Verificar se `ScheduleModule.forRoot()` esta no `app.module.ts`
3. Verificar se `RefreshModule` esta no `app.module.ts`
4. Testar manualmente: `curl -X POST http://localhost:3001/v1/cron/refresh -H "x-cron-secret: meteor-refresh-secret"`
5. Verificar status: `curl http://localhost:3001/v1/cron/status`

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
- **Coluna 1:** Navegacao (7 links internos)
- **Coluna 2:** Fontes de Dados (5 links externos)
- **Coluna 3:** Stack Tecnologica (5 links externos)
- **Coluna 4:** Card MeteorBot IA com mini chat
- **Rodape:** "Meteor — Creditos de Desenvolvimento: Carlos Alexandre"
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
  page.tsx                    # 5 abas: Noticias, Ondas, Points, Marees, Visao Geral
  components/
    SwellTabs.tsx             # Navegacao por abas com aria pattern
    ResumoIA.tsx              # Briefing Gemini com markdown
    WaveChart.tsx             # Grafico ApexCharts area (ondas)
    TideChart.tsx             # Grafico ApexCharts linha (mares)
    SpotGrid.tsx              # Cards de spots com filtros e busca
    SurfNews.tsx              # 10 noticias com imagens
    HourlySwell.tsx           # Grid responsivo 12h
    ConditionCards.tsx        # 5 mini cards de condicoes
    DailyTip.tsx              # Dica pratica do dia
    Skeletons.tsx             # Loading states (6 tipos)
```

### Hooks
| Hook | Arquivo | Descricao |
|------|---------|-----------|
| useSwell.ts | src/hooks/ | Busca GET /v1/oceanography |
| useHourlyMarine.ts | src/hooks/ | Busca GET /v1/oceanography/hourly |
| useAiSummary.ts | src/hooks/ | Busca GET /v1/oceanography/summary |

### Ordem das Abas
```
[Noticias] [Ondas] [Points] [Marees] [Visao Geral]
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
- Backend: `gemini.repository.ts` com `@google/genai`
- Prompt: briefing completo com 5 topicos (Ondas, Vento, Horarios, Points, Alertas)
- Max tokens: 600
- Cache: 1h no backend (`summaryCache`)
- Fallback: resumo estatico baseado nos dados quando Gemini falha

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
NEXT_PUBLIC_API_URL=https://meteor2-0-backend.vercel.app
```

**Não é necessário configurar no Vercel Dashboard** — o Next.js usa automaticamente `.env.production` em builds de produção.

#### Backend (Vercel)

Variáveis configuradas no Vercel Dashboard (Settings → Environment Variables):

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `FRONTEND_ORIGIN` | `https://meteor2-0-frontend.vercel.app` | CORS origin |
| `GEMINI_API_KEY` | *(chave secreta)* | API Gemini |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Modelo Gemini |
| `GEMINI_TEMPERATURE` | `0.7` | Temperatura |
| `FALLBACK_DIR` | `data` | Diretório fallback |

### CI/CD (GitHub Actions)

Pipeline ativo em `.github/workflows/ci.yml`:

**Jobs:**
- `backend-test`: Roda Jest (80 testes)
- `frontend-test`: Roda Vitest (41 testes)
- `lint`: oxlint (frontend)
- `build`: Valida compilação (após testes)

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
│   ├── vercel.json              # Config Vercel (monorepo)
│   └── .vercelignore            # Arquivos ignorados
├── backend/
│   ├── Dockerfile               # Container (alternativa Railway/Render)
│   ├── railway.json             # Deploy Railway (alternativa)
│   └── render.yaml              # Deploy Render (alternativa)
├── github-actions/
│   └── ci.yml                   # Pipeline CI/CD
└── env/
    ├── .env.frontend.example    # Vars frontend
    └── .env.backend.example     # Vars backend
```

### Documentação Completa

Consulte `DevOps/README.md` para guia detalhado de deploy.
