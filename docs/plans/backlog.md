# Meteor 2.0 — Backlog Priorizado (pós-Fase 5)

> Critérios de aceite citáveis `super-maker.md:38`. Fora do escopo scaffold `docs/plans/meteor-hud-mvp.md:1`.

## P0 — Próximo (após Fase 5 verde)

| Item | Descrição | Aceite | Verify |
|---|---|---|---|
| **DB history** | Persistir forecast (Prisma/Drizzle) + ingestão histórica | `GET /v1/forecast/history?locationId&from&to` retorna 30d, migração `prisma/schema.prisma` verde | `pnpm --filter backend test` + `prisma migrate` |
| **Auth settings** | User settings persistidos (localStorage → DB) `locationId`/`dayIndex` não resetam | Reload mantém `ilha-comprida` escolhido, `localStorage` sync | `useForecastBoard.test.tsx` + `vitest run` |
| **7d UI** | `DaySelector` D0-D6 + `WaveChart` paginado `days*24` | `GET /v1/forecast?days=7` → HUD 7 chips, chart 168 pontos | `pnpm --filter frontend build` |

## P1 — Médio

| Item | Descrição | Aceite | Verify |
|---|---|---|---|
| **Map** | Mapa Ilha Comprida/Vale Ribeira com pins `catalog/locations.ts:10` | `/map` rota com pins, sem roxo, radius 0-2px | `ux_audit.py` |
| **PWA** | `manifest.json` + `service-worker` + offline cache forecast 120s | Lighthouse PWA 90+, offline mostra cache | `lighthouse_audit.py --url http://localhost:3000` |
| **Rate limit** | `helmet` + `@nestjs/throttler` `POST /v1/ai-summary` | 10 req/min por IP, 429 envelope | `security_scan.py` + `curl -i` 11th → 429 |

## P2 — Futuro

| Item | Descrição | Aceite | Verify |
|---|---|---|---|
| **Deploy** | `Dockerfile` + `docker-compose.yml` + `.github/workflows/ci.yml` (lint/test/build) + `vercel.json` | `docker build` verde, CI `checklist.py` verde | `deployment-procedures` skill |
| **SEO** | `sitemap.ts` + `robots.ts` + OG `CapaMeteor.jpg` `Img/CapaMeteor.jpg:1` | `seo_checker.py` verde, OG `og:image` | `lighthouse_audit.py` |
| **Observability** | `pino` logger + `Sentry` + `tmp/` checkpoints `doe-framework.md:1` | Erros logados com `requestId`, `tmp/` checkpoint | `verify_all.py` |

## Não fazer (adiado conscientemente)

- Auth de usuários (fora de escopo scaffold `README.md:1`)
- Ingestão histórica antes de `checklist.py` verde
- CI completo antes de Fase 5 security
- OpenWeather (não entra, `DESIGN.md:1` fontes especializadas only)

## Regra

Todo item ≥3 steps → novo `docs/plans/<slug>.md` via `super-maker` Steps 0-3, verificação por step, `AUTH` para `git push`/`deploy`.
