# 📚 Especificação Técnica e Regras de Negócio do Sistema — Meteor 2.0

## 1. Visão Geral do Projeto
O **Meteor 2.0** é um Dashboard Tático (HUD) de telemetria e inteligência de dados focado geograficamente na região de **Ilha Comprida e Vale do Ribeira**. O sistema atua como um orquestrador que consome, cruza e normaliza dados dinâmicos de múltiplas fontes externas, fornecendo visualizações espaciais detalhadas (via mapas Leaflet) e resumos executivos gerados por Inteligência Artificial (Google Gemini Flash).

---

## 2. Regra de Negócio Crítica: Versionamento e Fluxo de Branches
Toda e qualquer alteração, funcionalidade nova ou correção de bug no projeto **DEVE** seguir estritamente o fluxo de branches isoladas:

1. **Isolamento por Domínio/Página:**
   - Cada página ou funcionalidade possui sua própria branch temática (ex: `feature/pagina-principal`, `feature/pagina-meteorologia`, `feature/pagina-swell`, `feature/pagina-transito`, `feature/pagina-noticias`, `feature/pagina-blog`, `feature/pagina-creditos`, `feature/backend-meteorology`, `feature/backend-oceanography`, `feature/backend-traffic`).
2. **Proibição de Commit Direto na `main`:**
   - É estritamente proibido realizar commits diretos de funcionalidades na branch `main`. Toda alteração deve ser desenvolvida em sua branch temática correspondente.
3. **Sincronização e Push:**
   - Após a conclusão e validação da tarefa na branch temática, o código é commitado com mensagem descritiva em padrão *Conventional Commits* e enviado ao repositório remoto na sua respectiva branch antes de qualquer mesclagem.

---

## 3. Arquitetura e Stack Tecnológica
O projeto é estruturado em um **Monorepo** (gerenciado via `pnpm` / `npm`), com clara separação entre cliente e servidor:

### **Backend (API e Orquestração):**
* **Framework:** NestJS (Node.js) com Express.
* **Padrão Arquitetural:** Divisão estrita em camadas (`Controller ➔ Service ➔ Repository`).
* **Módulos Atuais:**
  - `MeteorologyModule` (`GET /v1/meteorology`): Dados atmosféricos e estações (Open-Meteo / INMET).
  - `OceanographyModule` (`GET /v1/oceanography`): Telemetria de ondas, swell e marés (Open-Meteo Marine).
  - `TrafficModule` (`GET /v1/traffic`): Monitoramento em tempo real de rodovias (SP-222, BR-116) e balsas regionais.
* **Resiliência & Tratamento de Erros:** Respostas padronizadas via Envelope API (`success`, `data`, `error`), cache em memória (TTL de 120s) e tratamento de falhas em APIs externas.

### **Frontend (Cliente Web):**
* **Framework:** Next.js 15 (App Router) + React 19.
* **Estilização:** Tailwind CSS v4 com design system customizado para modo escuro arquitetural (`#121212`) e modo claro (`#F9FAFB`), utilizando azul aço corporativo (`#0284C7`) e acentos funcionais.
* **Geolocalização & Mapas (Padrão Nativo com Cleanup):** Para evitar conflitos de inicialização no React 19 (`Map container is already initialized`), os mapas usam controle direto via `useRef` e `L.map` com destruição explícita da instância no retorno de limpeza do `useEffect` (`map.remove()`).

---

## 4. Mapeamento das 7 Páginas Implementadas

1. **`/` (Principal - HUD Tático):**
   - Briefing Executivo automatizado gerado por Inteligência Artificial (Google Gemini).
   - Alerta Regional ativo (Defesa Civil).
   - **Barra de Pesquisa Rápida Global:** Permite encontrar seções e conteúdos instantaneamente.
   - **MeteorBot IA:** Assistente flutuante interativo posicionado em todas as páginas para responder dúvidas sobre o tempo, maré e trânsito.
   - Alternância global de **Tema (Claro / Escuro)** e **Idioma (Português / Espanhol)** no Header unificado.

2. **`/meteorologia` (Meteorologia & Vento):**
   - KPIs detalhados de temperatura média, velocidade e direção do vento, umidade relativa e pressão atmosférica (Conectado à API).
   - **Mapa Leaflet de Estações Meteorológicas** (INMET e Climatempo) na região do Vale do Ribeira.

3. **`/swell` (Swell & Picos):**
   - Banner Hero de Qualidade do Mar com algoritmo de classificação de ondas.
   - Indicadores de altura de onda, período do swell, direção principal e tábua de marés (Conectado à API).
   - **Mapa Leaflet de Picos de Surf** (Boqueirão Norte, Boqueirão Sul, etc.) com dicas de nível de dificuldade e vento ideal.

4. **`/transito` (Trânsito & Mobilidade Regional):**
   - Status em tempo real das principais rodovias de acesso (SP-222, BR-116/Regis Bittencourt) (Conectado à API).
   - Monitoramento do tempo de espera das travessias de balsa (Cananéia ⇄ Ilha Comprida).
   - **Mapa Leaflet de Mobilidade e Vias**.

5. **`/noticias` (Notícias Regionais do Vale do Ribeira):**
   - Feed unificado agregando as principais fontes oficiais e de grande mídia da região:
     - *G1 Santos e Região* (notícias gerais, turismo e segurança).
     - *Portal da Cidade Registro* (jornalismo diário, prestação de serviços e comércio).
     - *Diário do Ribeira / Registro Diário* (cobertura política, obras e infraestrutura).
     - *Prefeituras Oficiais & Defesa Civil* (decretos, avisos e boletins preventivos).
     - *Rádios Regionais / Rádio Eldorado* (cobertura em tempo real de trânsito e utilidade pública).

6. **`/blog` (Blog Técnico):**
   - Artigos aprofundados, guias de maré e análises sobre a dinâmica costeira e meteorológica do litoral sul de São Paulo.

7. **`/creditos` (Créditos & Fontes Oficiais):**
   - Painel institucional de transparência detalhando as APIs de clima/mar e a stack tecnológica empregada.

---

## 5. Como Executar o Sistema Localmente

Para rodar o ambiente completo, utilize dois terminais separados:

* **Backend:**
  ```bash
  cd apps/backend
  npm run dev
  ```
* **Frontend:**
  ```bash
  cd apps/frontend
  npm run dev
  ```
  *(Acesse em `http://localhost:3000`)*
