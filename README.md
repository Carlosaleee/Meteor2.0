# Meteor 2.0 — Tactical Surf & Regional Telemetry HUD

Dashboard tático e central de telemetria para **Ilha Comprida e Vale do Ribeira** — unificando meteorologia, oceanografia, trânsito regional, notícias oficiais e assistência de Inteligência Artificial em tempo real.

---

## 🚀 Arquitetura e Estrutura de Páginas

O sistema é construído em um monorepo moderno utilizando **Next.js 15 (App Router)** no Frontend e **NestJS** no Backend.

### 🗺️ As 7 Rotas Principais
1. **`/` (Principal):** HUD Tático unificado com Briefing Executivo de IA (Gemini Flash), campo de busca rápida de seções e cartões de status rápido.
2. **`/meteorologia` (Meteorologia):** Previsão detalhada, dados de temperatura, umidade, vento e **Mapa Leaflet de Estações**.
3. **`/swell` (Swell & Picos):** Telemetria marítima de ondas, swell, tábua de marés e **Mapa Leaflet de Picos de Surf**.
4. **`/transito` (Trânsito & Mobilidade):** Condições em tempo real das rodovias (SP-222, BR-116), travessias de balsa e **Mapa Leaflet de Vias**.
5. **`/noticias` (Notícias Regionais):** Feed agregado com as principais fontes oficiais da região (G1 Santos, Portal da Cidade Registro, Diário do Ribeira, Prefeituras e Rádios Regionais).
6. **`/blog` (Blog Técnico):** Artigos e guias especializados sobre o litoral e dinâmica costeira.
7. **`/creditos` (Créditos & Fontes):** Transparência institucional e atribuição das APIs oficiais integradas.

---

## 🤖 Recursos Interativos Globais
* **MeteorBot IA:** Widget flutuante integrado em todas as páginas para consultas em tempo real sobre o clima e as condições da região.
* **Seletor de Tema (Claro / Escuro):** Alternância instantânea de tokens visuais adaptados para redução de fadiga visual.
* **Seletor de Idioma (Português / Espanhol):** Preparação multilíngue para acessibilidade dos dados.

---

## 🛠️ Como Rodar o Sistema

Para rodar o ambiente completo localmente, utilize dois terminais separados:

### 1. Iniciar o Backend (NestJS)
```bash
cd apps/backend
npm install
npm run dev
```

### 2. Iniciar o Frontend (Next.js)
```bash
cd apps/frontend
npm install
npm run dev
```
*(Acesse em `http://localhost:3000`)*
