# Meteor HUD MVP — Plano Fable (Super-Maker)

> **Fusão:** `.agents` (25 agents, 48 skills) × `AGENTS_fable.md` (130 linhas)
> **Classificação:** Plan-first — escopo ambíguo + ação irreversível (`git push`)
> **Done:** `docs/plans/meteor-hud-mvp.md` aprovável com verificação observável por step; cada claim citável `file:line`.

## Step 0 — Classify
| Shape | Signal | Deliverable |
|---|---|---|
| Plan-first | "revise o plano", scope ambíguo HUD vs API vs deploy | Plano aprovável, stop para aprovação |

Fit gate: In sources (`DESIGN.md:1`, `forecast.service.ts:1`, `useForecastBoard.ts:1`) → run loop. Triviality: false (multi-arquivo).

## Step 1 — Define done
Plano com 6 fases, cada step verifica por observação (`pnpm --filter backend test` verde, `curl /v1/forecast` 200, `next build` verde, `checklist.py` verde). Sem verificação nomeada → pedir 1 pergunta.

## Step 2 — Evidence (paralelo)
- `DESIGN.md:1-73` graphite `#141414` laranja `#FF6A1A` dourado `#E0B429` radius 0-2px — OK `globals.css:1`
- `pnpm-workspace.yaml:1` `apps/*`, `package.json:4` `pnpm@11`
- `forecast/catalog/locations.ts:10` 6 locações Ilha Comprida+Vale Ribeira
- `forecast/forecast.service.ts:1` `Promise.all` 4 providers, SurfScore `swell*18 cap40+period*2.5 cap35-wind*2 cap30+20`
- `inmet.repository.ts:24` `replaceAll("-","-")` no-op (cosmético)
- `lib/api.ts:1` `days=3` hard-coded + não trata `success:false`
- 5 specs só, 0 integração/E2E, `docs/` não existia (criado agora), `Is git repo: no` → virou `git init:done`
- `super-maker.md:38` artefatos `docs/plans/<slug>.md` + backlog

Surpresa: `CacheModule ttl 120_000` ms vs segundos — corrigir fase 1.

## Step 3 — Decide
**Recomendação única:** Estabilizar antes de expandir (Fases 0-5). Alternativas: B deploy direto — perdeu (build/test nunca observados, costume failure); C auth/DB agora — perdeu (pirâmide invertida); D refactor visual — perdeu (DESIGN já 100%).

Escopo: `docs/plans/`, `docs/api.md`, `apps/backend/src/modules/forecast/**`, `apps/frontend/src/lib/api.ts`, `apps/frontend/src/hooks/**`, `apps/frontend/src/components/**`, `.gitignore`, `directives/`.

Fora: `auth`, `prisma/`, `manifest.json` (adiados).

AUTH gate: `git push` exige `AUTH: user said "..."` — presente agora.

## Fases

### Fase 0 — Foundations & Git (D)
- T0.1 `git init` + `branch -M main` + remote `Carlosaleee/Meteor2.0` + `.gitignore` `.env` — verify: `git ls-files | grep -q "^\.env$"` fail + `git remote -v` ok
- T0.2 `pnpm install` + `pnpm -r build` + `tsc --noEmit` — verify: ambos verdes
- T0.3 `directives/meteor-hud.md` + `execution/` + `tmp/` — verify: `ls`

### Fase 1 — Backend hardening (super-fullstack+guardian)
- T1.1 Fix `inmet.repository.ts:24` no-op, `stormglass` days, `CacheModule 120s` (`120` não `120_000`) — verify: `pnpm --filter backend test forecast.service.spec.ts`
- T1.2 Timeout 5s + circuit breaker providers — verify: `msw` mock ok/error/disabled
- T1.3 `helmet` + `throttler` — verify: `security_scan.py`

### Fase 1.2 — Frontend hardening
- T1.2.1 `lib/api.ts` trata `success:false` → `error.message` — verify: `curl /v1/forecast?locationId=unknown` 404 envelope
- T1.2.2 `useForecastBoard.ts` `Promise.all` + abort controller — verify: `vitest run`

### Fase 2 — Test pyramid (super-verifier)
- T2.1 Unit repos mocked `fetch` + SurfScore — verify: `jest --coverage` ≥80%
- T2.2 Integration `GET /v1/locations` + `GET /v1/forecast` 502 — verify: `pnpm --filter backend test`
- T2.3 E2E Playwright city switch + `SourceStrip` — verify: `playwright test`

### Fase 3 — Frontend & Design
- T3.1 `WaveChart` fallback `hourly<24` + skeleton — verify: `next build`
- T3.2 WCAG AA + Lighthouse ≥90 — verify: `ux_audit.py` + `lighthouse_audit.py`

### Fase 4 — Docs (super-maker)
- T4.1 `docs/api.md` curl + `README.md` — verify: reprodução sem perguntas
- T4.2 `docs/plans/backlog.md` (auth/DB/7d/PWA adiados) — verify: aceitação citável

### Fase 5 — Security & Checklist
- T5.1 `security_scan.py` + `npm audit` — verify: `checklist.py` Security→Lint→Schema→Tests→UX→SEO verde
- T5.2 `verify_all.py --url http://localhost:3001` — verify: Lighthouse+E2E verdes

## Verificação por step (binding)
Cada fase (a) done observado (rodou/contou), (b) redor ok (`build`+`lint`), (c) `TWINS:` se defect fix.

## AUTH
`AUTH: user said "git remote add origin https://github.com/Carlosaleee/Meteor2.0.git git branch -M main git push -u origin main repositorio remoto, continue"`

`PENDING: none` — push autorizado.

## Backlog (fora deste plano)
- Auth JWT + settings persistidos
- DB `prisma` history + ingestão
- 7d selector + map
- PWA + mobile audit
- CI + Docker
