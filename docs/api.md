# Meteor 2.0 — API Reference

> Base: `http://localhost:3001` (`NEXT_PUBLIC_API_URL`). Envelope: `{success, data, error:{code,message,details}}` via `common/http/api-envelope.ts:1` + `envelope.interceptor.ts:1` + `http-exception.filter.ts:1`.

## Health

```bash
curl http://localhost:3001/health
# {"status":"ok","service":"meteor-backend"} — health.controller.ts:1
```

## Forecast — `GET /v1/locations` + `GET /v1/forecast`

```bash
# catálogo
curl http://localhost:3001/v1/locations
# → [{id:"ilha-comprida", name:"Ilha Comprida", region:"ilha-comprida", lat:-24.73, lon:-47.55, inmetStationId:"A712"}, ...6] catalog/locations.ts:10

# forecast 3 dias (default)
curl "http://localhost:3001/v1/forecast?locationId=ilha-comprida&days=3"
# → {location, surfScore: 0-100, atmosphere:{temperatureC, windSpeedMs, windDirectionDeg, precipitationMm, hourly[]}, marine:{waveHeightM, wavePeriodS, waveDirectionDeg, swellHeightM, hourly[]}, sources:[{id:"open-meteo",status:"ok|error",...}, ...4]} forecast.service.ts:35

# 7 dias
curl "http://localhost:3001/v1/forecast?locationId=cananeia&days=7"

# erro — location desconhecida → 404
curl "http://localhost:3001/v1/forecast?locationId=unknown"
# → {success:false, data:null, error:{code:"LOCATION_NOT_FOUND", message:"Unknown locationId: unknown"}} forecast.service.ts:38

# erro — ambos providers obrigatórios falham → 502
# → {success:false, error:{code:"FORECAST_UNAVAILABLE", message:"Open-Meteo and Marine both failed"}} forecast.service.ts:52
```

**Merge/Prioridade:** `mergeAtmosphere` INMET > Open-Meteo `forecast.service.ts:74`; `mergeMarine` Marine + Stormglass (stormglass enriquece, disabled quando `STORMGLASS_API_KEY` vazia `stormglass.repository.ts:25`) `forecast.service.ts:99`; `computeSurfScore` `swell*18 cap40 + period*2.5 cap35 - wind*2 cap30 +20 clamp 0-100` `forecast.service.ts:121`; cache `120*1000` ms `forecast.module.ts:11` + `@CacheTTL(120*1000)` `forecast.controller.ts:18`; timeout 5s `AbortSignal.timeout(5000)` em todos os repos.

## AI Summary — `POST /v1/ai-summary`

```bash
curl -X POST http://localhost:3001/v1/ai-summary \
  -H "Content-Type: application/json" \
  -d '{"locationName":"Ilha Comprida","surfScore":72,"windSpeedMs":3,"waveHeightM":1.1,"swellHeightM":1.0,"wavePeriodS":9}'
# → {summary:"Resumo tático de surf em 2 frases, PT-BR, sem emoji ..."} gemini.repository.ts:13
# fallback quando GEMINI_API_KEY="" → "Ilha Comprida: score 72. Swell 1 m, vento 3 m/s." gemini.repository.ts:40
# → envelope success:true data:{summary}
```

**Env:** `env.schema.ts:3` `GEMINI_API_KEY` opcional default "", `STORMGLASS_API_KEY` opcional (disabled), `INMET_API_TOKEN` + `INMET_BASE_URL https://apitempo.inmet.gov.br`.

## Frontend — `NEXT_PUBLIC_API_URL`

`apps/frontend/src/lib/api.ts:10` `baseUrl = process.env.NEXT_PUBLIC_API_URL ?? http://localhost:3001` com `unwrapEnvelope` tratando `success:false` → throw `error.message`, `AbortSignal.timeout(5000)` em `fetchLocations`/`fetchForecast`/`fetchAiSummary`.

## Envelope

```ts
// success
{success:true, data:T, error:null}
// failure
{success:false, data:null, error:{code:string, message:string, details?:unknown}}
```

`envelope.interceptor.ts:6` envolve `data` se não for envelope; `http-exception.filter.ts:12` mapeia `HttpException` → envelope; `zod-validation.pipe.ts:4` → `VALIDATION_ERROR` 400.
