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
        common/        # Servicos compartilhados (fallback, http, config)
        modules/       # Modulos de dominio (meteorology, oceanography, traffic)
        data/          # JSONs de fallback (gitignored)
    frontend/          # App Next.js
      src/
        app/           # Paginas (8 rotas)
          meteorologia/
            page.tsx   # Card container principal
            components/ # 13 componentes
          swell/           # 5 abas + 11 componentes
            page.tsx
            components/
          transito/
          noticias/
          blog/
          creditos/
          mapa/
        components/    # Componentes reutilizaveis
          Header.tsx   # Nav responsiva
          Footer.tsx   # 4 colunas com chatbot
          PageBanner.tsx # Hero reutilizavel
        hooks/         # Hooks customizados
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

### Estilizacao
- Tailwind CSS v4 (sem tailwind.config.js)
- Design tokens em `globals.css` via `@theme` + `[data-theme="light"]`
- CSS custom properties para Header, Footer, Nav (dark + light)
- Padrao visual: slate-900, rounded-2xl, border-slate-800
- Icones: React Icons (Font Awesome) — `react-icons/fa`
- Tema: dark/light com `localStorage` + `prefers-color-scheme`
- Linha dourada: `var(--color-gold-line)` #E0B429 (dark) / #C49A1A (light)

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

## Padroes de UI

### Componentes React (Icones)
- Icones: React Icons (Font Awesome) — `react-icons/fa`
- Exemplo: `import { FaHome, FaCloudSun } from 'react-icons/fa'`

### Header
- Logo: "Meteor" com icone `FaWater`
- Linha dourada: `<div className="h-1 w-full bg-[var(--color-gold-line)]" />`
- Toggle tema: `FaSun`/`FaMoon`

### Nav Bar (Responsiva)
- Desktop: `hidden md:flex` — horizontal centrado
- Mobile: Hamburger (`FaBars`/`FaTimes`) com dropdown
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
- Uso: `<PageBanner title="Swell & Picos" subtitle="Descricao" />`
- Imagem: `banner-meteor.jpg` com gradient dourado
- Altura: 160px

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

## Pagina de Meteorologia (Guia Completo)

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
<div className="flex flex-col gap-3">
  <div className="flex items-center gap-3">
    <FaCloudSun /> <h1>Meteorologia</h1>
  </div>
  <p>Previsao de tempo, satelite e modelos numericos</p>
  <button onClick={refetch}>Atualizar</button>
</div>
<div className="flex gap-2">
  {/* Cards de temperatura por cidade */}
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
  page.tsx                    # 5 abas: Noticias, Ondas, Picos, Marees, Visao Geral
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
[Noticias] [Ondas] [Picos] [Marees] [Visao Geral]
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
// Topic emojis: 🏄 Ondas, 🌬️ Vento, ⏰ Horarios, 🏆 Picos, ⚠️ Alertas
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
- Prompt: briefing completo com 5 topicos (Ondas, Vento, Horarios, Picos, Alertas)
- Max tokens: 600
- Cache: 1h no backend (`summaryCache`)
- Fallback: resumo estatico baseado nos dados quando Gemini falha
