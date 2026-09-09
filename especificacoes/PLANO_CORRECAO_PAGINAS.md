# 🔧 Plano de Correção — Páginas Meteorologia, Swell & Trânsito

**Data:** 2026-09-09  
**Branch Atual:** `feature/pagina-transito`  
**Status:** ANÁLISE CONCLUÍDA → AGUARDANDO APROVAÇÃO

---

## 1. Diagnóstico — Causa Raiz

A análise dos três arquivos de componente de mapa revelou **dois bugs críticos e sobrepostos** que impedem a renderização.

### 🔴 Bug #1 — Directive `'use client'` ausente/corrompida (causa principal)

Os arquivos `WeatherMapClient.tsx`, `SwellMapClient.tsx` e `TrafficMapClient.tsx` têm na **linha 1** o seguinte literal:

```ts
'client';   // ← ERRADO — sem 'use'
```

O correto para um componente client-side no Next.js 15 (App Router) é:

```ts
'use client';  // ← CORRETO
```

**Impacto:** O Next.js App Router não identifica o arquivo como Client Component. O módulo tenta executar no servidor (SSR), onde `window`, `document` e a API do Leaflet simplesmente **não existem**. Isso causa um crash silencioso ou erro de hidratação que impede a renderização de toda a página.

> **Evidência:** `git show feature/pagina-meteorologia:apps/frontend/src/components/WeatherMapClient.tsx` confirmou `'client';` na linha 1.

---

### 🟡 Bug #2 — Inconsistência de estratégia de mapa entre páginas

A página `/transito` importa `BaseLeafletMap` (abordagem correta com `useRef` + `L.map` nativo, que respeita o ciclo de vida do React 19), enquanto as páginas `/meteorologia` e `/swell` importam `WeatherMapClient` e `SwellMapClient` que usam `react-leaflet`'s `<MapContainer>` (abordagem mais frágil com React 19 StrictMode).

---

### 🟡 Bug #3 — `reactStrictMode: true` + Leaflet dupla inicialização

O `next.config.ts` tem `reactStrictMode: true`. No React 19 com StrictMode, os efeitos de `useEffect` são executados **duas vezes** em dev. Os componentes `WeatherMapClient` e `SwellMapClient` criam a instância do mapa dentro do componente `react-leaflet` sem cleanup adequado, gerando o erro `Map container is already initialized`.

---

## 2. Mapa de Arquivos Afetados por Branch

| Página | Branch | Arquivo a Corrigir | Bug |
|--------|--------|--------------------|-----|
| `/meteorologia` | `feature/pagina-meteorologia` | `WeatherMapClient.tsx` (L1) + refatoração para nativo | #1 e #3 |
| `/swell` | `feature/pagina-swell` | `SwellMapClient.tsx` (L1) + refatoração para nativo | #1 e #3 |
| `/transito` | `feature/pagina-transito` | `TrafficMapClient.tsx` (L1) — arquivo legado | #1 (legado) |

---

## 3. Plano de Execução (Passo a Passo)

> ⚠️ **Regra de Negócio:** Cada correção é executada e commitada **em sua própria branch temática**. Nunca na `main`.

---

### FASE 1 — Branch `feature/pagina-meteorologia`

#### Passo 1.1 — Checkout da branch
```bash
git checkout feature/pagina-meteorologia
```

#### Passo 1.2 — Refatorar `WeatherMapClient.tsx`

Substituir o conteúdo completo do arquivo `apps/frontend/src/components/WeatherMapClient.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STATIONS = [
  {
    position: [-24.73, -47.55] as [number, number],
    label: 'Estação INMET - Ilha Comprida',
    detail: 'Temp: 26°C | Vento: 18 km/h SE',
  },
  {
    position: [-24.49, -47.84] as [number, number],
    label: 'Estação INMET - Iguape',
    detail: 'Temp: 25°C | Vento: 15 km/h E',
  },
];

export function WeatherMapClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const domEl = containerRef.current as HTMLElement & { _leaflet_id?: unknown };
    if (domEl._leaflet_id) {
      domEl._leaflet_id = null;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const stationIcon = L.divIcon({
      className: 'custom-station',
      html: `<div style="width:28px;height:28px;background:#0284c7;border:3px solid white;border-radius:50%;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:10px;">IN</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const map = L.map(containerRef.current, {
      center: [-24.73, -47.55],
      zoom: 10,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    STATIONS.forEach(s => {
      L.marker(s.position, { icon: stationIcon })
        .bindPopup(`<div class="text-xs"><strong>${s.label}</strong><br>${s.detail}</div>`)
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: '400px' }} />;
}
```

#### Passo 1.3 — Commit na branch
```bash
git add apps/frontend/src/components/WeatherMapClient.tsx
git commit -m "fix(meteorologia): correct 'use client' directive and refactor map to native Leaflet lifecycle"
git push origin feature/pagina-meteorologia
```

---

### FASE 2 — Branch `feature/pagina-swell`

#### Passo 2.1 — Checkout da branch
```bash
git checkout feature/pagina-swell
```

#### Passo 2.2 — Refatorar `SwellMapClient.tsx`

Substituir o conteúdo completo do arquivo `apps/frontend/src/components/SwellMapClient.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SPOTS = [
  {
    position: [-24.75, -47.58] as [number, number],
    label: 'Boqueirão Norte — Ilha Comprida',
    detail: 'Nível: Intermediário<br>Melhor Vento: Terral (Oeste)',
  },
  {
    position: [-24.95, -47.88] as [number, number],
    label: 'Boqueirão Sul — Ilha Comprida',
    detail: 'Nível: Avançado<br>Melhor Vento: Sudoeste',
  },
];

export function SwellMapClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const domEl = containerRef.current as HTMLElement & { _leaflet_id?: unknown };
    if (domEl._leaflet_id) {
      domEl._leaflet_id = null;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const spotIcon = L.divIcon({
      className: 'custom-spot',
      html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#10b981,#059669);border:3px solid white;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;">🌊</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const map = L.map(containerRef.current, {
      center: [-24.85, -47.72],
      zoom: 11,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    SPOTS.forEach(s => {
      L.marker(s.position, { icon: spotIcon })
        .bindPopup(`<div class="text-xs"><strong>${s.label}</strong><br>${s.detail}</div>`)
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: '400px' }} />;
}
```

#### Passo 2.3 — Commit na branch
```bash
git add apps/frontend/src/components/SwellMapClient.tsx
git commit -m "fix(swell): correct 'use client' directive and refactor map to native Leaflet lifecycle"
git push origin feature/pagina-swell
```

---

### FASE 3 — Branch `feature/pagina-transito`

**Objetivo:** Limpar o `TrafficMapClient.tsx` (arquivo legado com bug idêntico).

A página `/transito` já usa `BaseLeafletMap` corretamente. O `TrafficMapClient.tsx` não é importado pela página atual, mas existe no repositório com `'client'` na linha 1.

#### Passo 3.1 — Branch já ativa
```bash
# já está em feature/pagina-transito (branch atual)
```

#### Passo 3.2 — Remover arquivo legado
```bash
git rm apps/frontend/src/components/TrafficMapClient.tsx
git commit -m "fix(transito): remove unused TrafficMapClient.tsx with invalid 'client' directive"
git push origin feature/pagina-transito
```

---

## 4. Checklist de Verificação Pós-Execução

Após todas as fases, com o servidor dev rodando (`npm run dev` no `apps/frontend`):

- [ ] Navegar para `http://localhost:3000/meteorologia` — mapa renderiza com 2 marcadores INMET
- [ ] Navegar para `http://localhost:3000/swell` — mapa renderiza com Boqueirão Norte e Sul
- [ ] Navegar para `http://localhost:3000/transito` — mapa renderiza com SP-222 e Balsa Cananéia
- [ ] Console do browser: sem erro `Map container is already initialized`
- [ ] Console do browser: sem erros de hidratação React
- [ ] Nenhum arquivo com `'client'` (sem `use`) restante em `src/components/`

---

## 5. Resumo Executivo

| # | Causa | Arquivo | Linha | Correção |
|---|-------|---------|-------|----------|
| 1 | `'client'` sem `use` | `WeatherMapClient.tsx` | 1 | `'use client'` + refatoração nativa |
| 2 | `'client'` sem `use` | `SwellMapClient.tsx` | 1 | `'use client'` + refatoração nativa |
| 3 | `'client'` sem `use` (legado) | `TrafficMapClient.tsx` | 1 | Remoção do arquivo |
| 4 | `react-leaflet` + StrictMode sem cleanup | `WeatherMapClient.tsx`, `SwellMapClient.tsx` | global | `useRef + L.map` nativo com `map.remove()` |

---

## 6. Regras de Negócio Aplicadas

- ✅ Cada página tem sua branch isolada (`feature/pagina-*`)
- ✅ Commits em padrão Conventional Commits (`fix(scope): message`)
- ✅ Push na branch temática (nunca na `main`)
- ✅ Nenhuma instalação ou alteração de dependências
- ✅ Nenhum commit cruzado entre branches
