# Meteor 2.0 — Tactical HUD & Regional Intelligence Hub

Dashboard tático e central de inteligência regional focado na região de Ilha Comprida e Vale do Ribeira. O sistema atua como um orquestrador avançado de dados, agregando em tempo real informações meteorológicas, oceanográficas, de mobilidade urbana (trânsito), notícias cotidianas locais e resumos executivos gerados por Inteligência Artificial.

## 🏗️ Arquitetura e Stack Tecnológica
O projeto é estruturado em um ambiente de Monorepo gerenciado via `pnpm`, garantindo total desacoplamento entre as camadas de serviço da API e a interface do usuário.

### Backend (API & Orquestração)
* **Framework:** NestJS + Express
* **Padrão Arquitetural:** Controller → Service → Repository
* **Resiliência e Performance:** Cache (`@nestjs/cache-manager` com TTL de 120s), Throttler (Rate Limit) e Helmet para segurança de cabeçalhos.
* **Validação:** Zod em pipelines estritos (`env.schema.ts`, DTOs de consulta).
* **Testes:** Jest

### Frontend (Interface & Visualização)
* **Framework:** Next.js 15 (App Router) + React 19
* **Mapas e Espacialização:** Leaflet para renderização interativa de picos, estações, rotas de tráfego e pontos de interesse regional.
* **Estilização e Layout:** Arquitetura modular baseada em cards e diretrizes de design de alto contraste.
* **Testes:** Vitest

## 📡 Ecossistema de Fontes de Dados e Integrações
O Meteor 2.0 centraliza múltiplos provedores externos e bases informacionais para construir um panorama completo da região:

* **Meteorologia e Clima:**
  * **INMET:** Dados primários e em tempo real das estações locais (como a estação A712).
  * **Climatempo:** Previsão meteorológica regionalizada de alta precisão.
  * **Open-Meteo (Atmosfera):** Dados atmosféricos base (temperatura, ventos, precipitação).
* **Oceanografia (Surf e Mar):**
  * **Open-Meteo Marine:** Telemetria oceânica básica (ondas e swells).
  * **Stormglass:** Dados marítimos de alta precisão (com suporte a *fallback* automático).
* **Mobilidade Urbana e Trânsito:**
  * Monitoramento de fluxo e condições de vias principais da região (como Rodovia Régis Bittencourt - BR-116 e SP-222).
* **Cotidiano Regional e Notícias:**
  * Agregação de portais de referência regional: *G1 Santos e Região*, *Portal da Cidade Registro*, *Diário do Ribeira*, portais oficiais das prefeituras (Ilha Comprida, Iguape, Cananeia e Registro), além de boletins da Defesa Civil e rádios locais (ex: Rádio Eldorado).
* **Inteligência Artificial:**
  * **Google Gemini (`gemini-2.0-flash`):** Processamento em linguagem natural de toda a massa de dados para entrega de resumos táticos imediatos de 2 frases.

## 🎨 Diretrizes de UI/UX e Design
A interface do sistema segue rigorosos padrões de usabilidade validados para portais de dados e notícias de grande volume:

* **Paleta Neutra e Estrutural:** Uso de tons de cinza profundos ou superfícies limpas (modo adaptativo), evitando branco ou preto puros para mitigar a fadiga visual em leituras estendidas.
* **Cores Funcionais Estritas:** Tons de azul institucional para dados de confiança, âmbar/laranja para alertas operacionais e trânsito, e vermelho restrito exclusivamente a *Breaking News* ou alertas severos de tempestade.
* **Tipografia Otimizada:** Emprego de fontes *Sans-Serif* geométricas (como *Inter* ou *Roboto*) para garantir máxima legibilidade em painéis numéricos densos e textos jornalísticos.
* **Hierarquia de Leitura Crítica:** Agrupamento modular em *cards* isolados no padrão *above the fold*, destacando variáveis críticas (temperatura, vento, nível de criticidade de vias) em tamanhos ampliados.

## 📁 Estrutura do Monorepo
```text
Meteor_2.0/
├── pnpm-workspace.yaml          # Definição dos pacotes do monorepo
├── apps/
│   ├── backend/                 # API NestJS (Orquestração, Repositórios, IA)
│   └── frontend/                # Next.js App Router (HUD, Leaflet, Componentes)
└── docs/                        # Documentação de API, planos e backlogs

🚀 Instalação e Execução Local
Pré-requisitos
Node.js: >= 22

pnpm: 11 (corepack enable && corepack prepare pnpm@11 --activate)

Configuração de Ambiente
Copie o arquivo de exemplo de variáveis de ambiente:

Bash
cp .env.example .env
Preencha as chaves obrigatórias e opcionais no arquivo .env gerado (como a GEMINI_API_KEY).

Instalação de Dependências
Bash
pnpm install
Executando em Modo de Desenvolvimento
Bash
# Inicia simultaneamente o backend e o frontend no ambiente de desenvolvimento
pnpm dev
📄 Licença
Distribuído sob a licença MIT © 2026 Carlos Alexandre. Consulte o arquivo LICENSE para mais detalhes.
