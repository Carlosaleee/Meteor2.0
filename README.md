# Meteor 2.0 — Tactical Surf Telemetry HUD

> Dashboard HUD tático para surf/telemetria em Ilha Comprida e Vale do Ribeira — graphite/preto + laranja (vento) + dourado (Surf Score/swell), radius 0-2px, sem roxo, sem azul genérico. `DESIGN.md:1` é a fonte da verdade; `apps/frontend/src/app/globals.css:1` `@theme` consome tokens.

**Stack:** `pnpm@11` workspace `apps/*` (`pnpm-workspace.yaml:1`), `apps/backend` NestJS 11 + Express `main.ts:1` (`ValidationPipe`, `CORS`, `ExceptionFilter`), `apps/frontend` Next.js 15 App Router + React 19 + Tailwind v4 + Motion `spring`.

## Reprodução

```bash
# 1. env
cp .env.example .env
# edite .env: PORT=3001, FRONTEND_ORIGIN=http://localhost:3000, GEMINI_API_KEY (opcional), STORMGLASS_API_KEY (opcional disabled), INMET_API_TOKEN (opcional), GITHUB_TOKEN (opcional), NEXT_PUBLIC_API_URL=http://localhost:3001

# 2. install
pnpm install

# 3. dev (paralelo)
pnpm dev
# → backend http://localhost:3001 (GET /health, GET /v1/locations, GET /v1/forecast?locationId=ilha-comprida)
# → frontend http://localhost:3000 (HUD)

# 4. lint / test / build
pnpm --filter backend lint && pnpm --filter frontend lint
pnpm --filter backend test   # repo specs + service + controller — forecast.service.spec.ts:1, 8 specs 455 linhas Fase 2
pnpm --filter frontend test  # vitest — schemas.test.ts, SurfScore.test.tsx, useForecastBoard.test.tsx, api.test.ts
pnpm --filter backend build && pnpm --filter frontend build

# 5. verificação Fable
python .agents/scripts/checklist.py .        # Security→Lint→Schema→Tests→UX→SEO
python .agents/scripts/verify_all.py . --url http://localhost:3001  # + Lighthouse + Playwright
```

## Forecast Pipeline

`open-meteo.repository.ts:23` atmosfera + `open-meteo-marine.repository.ts:22` ondas (sem chave) + `stormglass.repository.ts:29` premium disabled se `STORMGLASS_API_KEY=""` + `inmet.repository.ts:21` estações `A712` Ilha Comprida/Iguape e `A746` Cananeia/Registro/Jacupiranga/Cajati `catalog/locations.ts:10`. Orquestração `forecast.service.ts:35` `Promise.all` 5s timeout, merge `INMET > Open-Meteo` `mergeAtmosphere:74`, `Marine + Stormglass` `mergeMarine:99`, `computeSurfScore:121` clamped 0-100, cache `120*1000` ms `forecast.module.ts:11`.

## API

Ver `docs/api.md:1` — `GET /health`, `GET /v1/locations`, `GET /v1/forecast?locationId&days=1-7`, `POST /v1/ai-summary` (`@google/genai` `gemini-2.0-flash` PT-BR 2 frases).

## Design Tokens

`bg #0A0A0A, graphite #141414, surface #1C1C1C, line #2A2A2A, ink #E8E4DC, muted #8A8478, orange #FF6A1A, gold #E0B429, hazard #FF3B1A` `DESIGN.md:1` → `globals.css:1`.

## Super Agents (Fable Fusion 2026.8.28)

`.agents/agent/super-*.md:1` — `super-orchestrator` (≥2 domínios), `super-fullstack` (E2E), `super-guardian` (security), `super-verifier` (test), `super-maker` (plan). `fable-method` 130 linhas + `references/` 11 arquivos.

## Git

```bash
git init
git remote add origin https://github.com/Carlosaleee/Meteor2.0.git
git branch -M main
git add .
git commit -m "chore: initial commit - Meteor 2.0 workspace and architecture setup"
git push -u origin main
# .env gitignored (.gitignore:2), .agents/ local, .opencode/mcp/github-server.mjs com Octokit token só process.env.GITHUB_TOKEN
```

## Backlog

Ver `docs/plans/backlog.md:1` — auth, DB history, 7d UI, PWA, CI/Docker adiados pós-Fase 5.

## Fases

`docs/plans/meteor-hud-mvp.md:1` — Fase 0 git, Fase 1 hardening (INMET no-op, TTL, stormglass days, timeouts), Fase 2 pirâmide testes, Fase 3 build/a11y, Fase 4 docs, Fase 5 security.
