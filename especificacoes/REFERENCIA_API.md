# Referencia da API — Meteor 2.0

> **Ultima atualizacao:** 24/09/2026 (review 2026-09: +4 endpoints, rate limit 60 loopback, envelope global)
>
> **Documentos relacionados:** [SYSTEM_SPEC.md](./SYSTEM_SPEC.md) · [GUIA_DESENVOLVEDOR.md](./GUIA_DESENVOLVEDOR.md) · [../README.md](../README.md)

Base URL: http://localhost:3001

**Envelope global:** todo response de sucesso passa pelo `EnvelopeInterceptor` e chega como `{"success": true, "data": <payload>, "error": null}`. Os exemplos deste documento mostram o payload de `data` por brevidade (exceto onde o envelope e relevante, como erros).

---

## GET /health

Verificacao de saude do servico.

**Response:**
```json
{
  "status": "ok",
  "service": "meteor-backend"
}
```

---

## GET /v1/meteorology

Dados meteorologicos em tempo real para uma localizacao, incluindo previsao horaria (24h) e diaria (7 dias).

**Query Parameters:**
| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| locationId | string | Nao | ID da localizacao (default: ilha-comprida) |

**Localizacoes disponiveis:**
| ID | Nome | Coordenadas |
|----|------|-------------|
| ilha-comprida | Ilha Comprida | -24.73, -47.55 |
| iguape | Iguape | -24.70, -47.55 |
| cananeia | Cananeia | -25.01, -47.92 |
| registro | Registro | -24.48, -47.84 |

**Exemplo de Request:**
```
GET /v1/meteorology?locationId=ilha-comprida
```

**Response:**
```json
{
  "location": "Ilha Comprida",
  "locationId": "ilha-comprida",
  "timestamp": "2026-09-10T14:00:00.000Z",
  "current": {
    "temperature": 21.5,
    "apparentTemperature": 20.8,
    "humidity": 82,
    "windSpeed": 14.3,
    "windDirection": 110,
    "pressure": 1018.2,
    "precipitation": 0,
    "weatherCode": 2
  },
  "hourly": [
    {
      "time": "2026-09-10T14:00:00",
      "temperature": 22,
      "humidity": 80,
      "windSpeed": 15,
      "windDirection": 115,
      "weatherCode": 2,
      "precipitationProbability": 10,
      "precipitation": 0,
      "cloudCover": 35,
      "visibility": 10000
    }
  ],
  "daily": [
    {
      "date": "2026-09-10",
      "tempMax": 24,
      "tempMin": 17,
      "weatherCode": 2,
      "precipitationSum": 0,
      "precipitationProbabilityMax": 15,
      "windSpeedMax": 20,
      "uvIndexMax": 6,
      "sunrise": "2026-09-10T06:12:00",
      "sunset": "2026-09-10T18:05:00"
    }
  ],
  "forecastMax": 24,
  "forecastMin": 17
}
```

**Campos do response — Current:**
| Campo | Tipo | Descricao |
|-------|------|-----------|
| location | string | Nome da localizacao |
| locationId | string | ID da localizacao |
| timestamp | string | Horario da resposta (ISO 8601) |
| current.temperature | number | Temperatura atual (Celsius) |
| current.apparentTemperature | number | Sensacao termica (Celsius) |
| current.humidity | number | Umidade relativa (%) |
| current.windSpeed | number | Velocidade do vento (km/h) |
| current.windDirection | number | Direcao do vento (graus) |
| current.pressure | number | Pressao atmosferica (hPa) |
| current.precipitation | number | Precipitacao (mm) |
| current.weatherCode | number | Codigo WMO do tempo |

**Campos do response — Hourly (array de 24h):**
| Campo | Tipo | Descricao |
|-------|------|-----------|
| hourly[].time | string | Horario (ISO 8601) |
| hourly[].temperature | number | Temperatura (Celsius) |
| hourly[].humidity | number | Umidade (%) |
| hourly[].windSpeed | number | Velocidade do vento (km/h) |
| hourly[].windDirection | number | Direcao do vento (graus) |
| hourly[].weatherCode | number | Codigo WMO do tempo |
| hourly[].precipitationProbability | number | Probabilidade de chuva (%) |
| hourly[].precipitation | number | Precipitacao (mm) |
| hourly[].cloudCover | number | Cobertura de nuvens (%) |
| hourly[].visibility | number | Visibilidade (metros) |

**Campos do response — Daily (array de 7 dias):**
| Campo | Tipo | Descricao |
|-------|------|-----------|
| daily[].date | string | Data (YYYY-MM-DD) |
| daily[].tempMax | number | Temperatura maxima (Celsius) |
| daily[].tempMin | number | Temperatura minima (Celsius) |
| daily[].weatherCode | number | Codigo WMO do tempo |
| daily[].precipitationSum | number | Precipitacao acumulada (mm) |
| daily[].precipitationProbabilityMax | number | Probabilidade maxima de chuva (%) |
| daily[].windSpeedMax | number | Velocidade maxima do vento (km/h) |
| daily[].uvIndexMax | number | Indice UV maximo |
| daily[].sunrise | string | Nascer do sol (ISO 8601) |
| daily[].sunset | string | Por do sol (ISO 8601) |

---

## GET /v1/meteorology/news

Noticias meteorologicas e alertas em tempo real, coletados do INMET, CPTEC/INPE e Defesa Civil.

**Query Parameters:**
| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| cityId | string | Nao | Filtrar por cidade (ilha-comprida, iguape, cananeia, registro) |

**Response:**
```json
{
  "news": [
    {
      "id": "string",
      "cityId": "ilha-comprida",
      "title": "Alerta de tempestade para o litoral sul",
      "source": "INMET",
      "type": "alerta",
      "url": "https://apitempo.inmet.gov.br/...",
      "publishedAt": "2026-09-21T12:00:00.000Z"
    }
  ],
  "timestamp": "2026-09-21T12:00:00.000Z"
}
```

**Tipos de noticia:**
| Tipo | Descricao |
|------|-----------|
| alerta | Alerta meteorologico ativo (INMET, Defesa Civil) |
| informe | Informe meteorologico (CPTEC) |
| boletim | Boletim meteorologico geral |

**Fontes de dados:**
- INMET (apitempo.inmet.gov.br) — Estacoes automaticas SP
- CPTEC/INPE (cptec.inpe.br) — Previsoes regionais
- Defesa Civil SP (defesacivil.sp.gov.br) — Alertas de risco

---

## GET /v1/oceanography

Dados oceanicos de ondas, swell e marees.

**Query Parameters:** Nenhum

**Response:**
```json
{
  "location": "Ilha Comprida & Costa",
  "timestamp": "2026-09-10T14:00:00.000Z",
  "current": {
    "waveHeight": 1.1,
    "wavePeriod": 9,
    "waveDirection": 145,
    "swellHeight": 0.9,
    "swellPeriod": 10,
    "swellDirection": 138
  },
  "qualityLabel": "Boas",
  "qualityEmoji": "🏄",
  "bestTime": "07:00 - 10:00",
  "nextTide": "06:45",
  "tideCoefficient": 0.78,
  "spots": [
    {
      "id": "boqueirao-norte",
      "name": "Boqueirao Norte",
      "lat": -24.75,
      "lon": -47.58,
      "level": "intermediate",
      "bestWind": "Terral (Oeste)",
      "exposure": "Sul/Sudeste",
      "howToGetThere": "https://www.google.com/maps/dir/?api=1&destination=-24.75,-47.58"
    }
  ]
}
```

**Campos do response:**
| Campo | Tipo | Descricao |
|-------|------|-----------|
| current.waveHeight | number | Altura da onda (metros) |
| current.wavePeriod | number | Periodo da onda (segundos) |
| current.waveDirection | number | Direcao da onda (graus) |
| current.swellHeight | number | Altura do swell (metros) |
| current.swellPeriod | number | Periodo do swell (segundos) |
| current.swellDirection | number | Direcao do swell (graus) |
| qualityLabel | string | Classificacao: Flat, Pequenas, Boas, Classico! |
| qualityEmoji | string | Emoji da qualidade |
| bestTime | string | Melhor horario para surf |
| nextTide | string | Proxima mare alta |
| tideCoefficient | number | Coeficiente de mare |
| spots | array | Lista de spots de surf |
| spots[].exposure | string | Exposicao do pico |
| spots[].howToGetThere | string | Link Google Maps |

---

## GET /v1/oceanography/hourly

Previsao hourly de ondas para as proximas 12 horas.

**Response:** Array de objetos com os mesmos campos do current do /v1/oceanography, mas ao longo do tempo.

```json
[
  {
    "time": "2026-09-10T15:00",
    "waveHeight": 1.2,
    "wavePeriod": 9.5,
    "waveDirection": 140,
    "swellHeight": 0.8,
    "swellPeriod": 10.2,
    "swellDirection": 135
  }
]
```

---

## GET /v1/oceanography/summary

Resumo tatico de surf gerado por Gemini AI.

**Response:**
```json
{
  "summary": "🏄 **Condições das Ondas**\n- Altura: 1.1m...\n\n🌬️ **Vento**\n- Ventos favoráveis...",
  "cached": false
}
```

| Campo | Tipo | Descricao |
|-------|------|-----------|
| summary | string | Briefing tatico com 5 topicos (Ondas, Vento, Horarios, Points, Alertas) |
| cached | boolean | Se true, dados vieram do cache (1h TTL) |

**Cache:** Resumo e cacheado por 1 hora no backend.

---

## GET /v1/traffic

Status de transito das rodovias regionais.

**Query Parameters:** Nenhum

**Exemplo de Request:**
```
GET /v1/traffic
```

**Response:**
```json
{
  "timestamp": "2026-09-10T14:00:00.000Z",
  "location": "Vale do Ribeira",
  "routes": [
    {
      "id": "sp-222",
      "name": "Rodovia SP-222",
      "stretch": "Iguape ⇄ Cananeia",
      "condition": "LIVRE",
      "description": "Trafego fluindo normalmente sem retencoes.",
      "updatedAt": 1757354400000
    },
    {
      "id": "br-116",
      "name": "Rodovia Regis Bittencourt (BR-116)",
      "stretch": "Trecho Registro",
      "condition": "MODERADO",
      "description": "Fluxo intenso de veiculos pesados na serra.",
      "updatedAt": 1757354400000
    },
    {
      "id": "balsa-cananeia",
      "name": "Travessia de Balsa",
      "stretch": "Cananeia ⇄ Ilha Comprida",
      "condition": "OPERACIONAL",
      "description": "Tempo de espera estimado: 15 min",
      "updatedAt": 1757354400000,
      "waitTimeMinutes": 15
    }
  ]
}
```

**Condicoes possiveis:**
| Condicao | Descricao |
|----------|-----------|
| LIVRE | Trafego fluindo sem restricoes |
| MODERADO | Fluxo intenso mas fluindo |
| LENTO | Retencoes e lentidao |
| OPERACIONAL | Balsa funcionando |
| INTERROMPIDO | Via bloqueada |

---

## GET /v1/news

Noticias de surf (WSL + Circulo Paulista), rankings oficiais WSL e calendario de eventos. Cache 30min no backend.

**Query Parameters:** Nenhum

**Exemplo de Request:**
```
GET /v1/news
```

**Response (payload de `data`):**
```json
{
  "news": [
    {
      "id": "wsl-trestles-miguel-vence",
      "title": "Miguel Pupo vence Trestles e sobe para 4o do ranking mundial",
      "source": "World Surf League",
      "sourceUrl": "https://www.worldsurfleague.com",
      "url": "https://ne9.com.br/wsl-trestles-miguel-pupo-erin-brooks-ranking/",
      "description": "Miguel Pupo derrotou Kanoa Igarashi na final...",
      "image": "https://d3qf8nvav5av0u.cloudfront.net/...",
      "category": "WSL",
      "publishedAt": "2026-09-23T01:56:08.518Z"
    }
  ],
  "rankings": {
    "men": [
      { "rank": 1, "name": "Yago Dora", "country": "Brazil", "points": 42780, "trend": 2 }
    ],
    "women": [
      { "rank": 1, "name": "...", "country": "...", "points": 0, "trend": 0 }
    ]
  },
  "events": [
    {
      "name": "Banco do Brasil Sao Sebastiao Pro",
      "location": "Sao Sebastiao, Sao Paulo, Brazil",
      "dates": "Sep 26 - Oct 3",
      "status": "Upcoming",
      "tour": "Challenger Series"
    }
  ],
  "timestamp": "2026-09-25T01:56:08.518Z"
}
```

**Campos do response:**
| Campo | Tipo | Descricao |
|-------|------|-----------|
| news[].id | string | ID unico da noticia |
| news[].category | string | `WSL` ou `Paulista` |
| news[].publishedAt | string | Data de publicacao (ISO 8601) — sempre 12 noticias (ultimos 7 dias) |
| rankings.men[] / women[] | array | Top 15 do ranking WSL (rank, name, country, points, trend) |
| events[].status | string | `Completed`, `Standby` ou `Upcoming` (Upcoming listado primeiro) |
| timestamp | string | Momento da montagem da resposta (ISO 8601) |

**Fontes:** WSL (worldsurfleague.com — parser da tabela HTML real) + SPSurf (RSS). Fallback: `data/fallback-news.json`. Refresh: cron 1h (leve) + 6h (completo).

---

## GET /v1/noticias-regionais

Noticias regionais do Vale do Ribeira e status de rodovias.

**Query Parameters:** Nenhum

**Exemplo de Request:**
```
GET /v1/noticias-regionais
```

**Response:**
```json
{
  "news": [
    {
      "id": "reg-001",
      "title": "Defesa Civil emite alerta preventivo para rajadas de vento na costa sul",
      "source": "Defesa Civil SP",
      "sourceUrl": "https://www.defesacivil.sp.gov.br",
      "url": "https://www.defesacivil.sp.gov.br",
      "description": "Alerta preventivo vale para todo o litoral sul de SP com rajadas de ate 60 km/h.",
      "image": "",
      "category": "noticia",
      "publishedAt": "2026-09-12T08:00:00.000Z"
    }
  ],
  "routes": [
    {
      "id": "sp-222",
      "name": "SP-222",
      "condition": "LIVRE",
      "description": "Trafego fluindo normalmente",
      "updatedAt": "2026-09-12T12:00:00.000Z"
    }
  ],
  "timestamp": "2026-09-12T12:00:00.000Z"
}
```

**Campos do response:**
| Campo | Tipo | Descricao |
|-------|------|-----------|
| news[].id | string | ID unico da noticia |
| news[].title | string | Titulo da noticia |
| news[].source | string | Fonte da noticia |
| news[].sourceUrl | string | URL da fonte |
| news[].url | string | URL da noticia |
| news[].description | string | Descricao resumida |
| news[].category | string | Categoria: noticia, transito, policial, turismo, cotidiano |
| news[].publishedAt | string | Data de publicacao (ISO 8601) |
| routes[].id | string | ID da rodovia |
| routes[].name | string | Nome da rodovia |
| routes[].condition | string | Condicao: LIVRE, MODERADO, LENTO, BLOQUEADO, OPERACIONAL, INTERROMPIDO |
| routes[].description | string | Descricao da condicao |

---

## GET /v1/noticias-regionais/news

Noticias regionais filtradas por categoria (retorna **array** de `RegionalNewsItem`, sem `routes` nem `timestamp`).

**Query Parameters:**
| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| category | string | Nao | `todas` (default), `transito`, `policial`, `turismo`, `cotidiano`, `noticia` |

**Exemplo de Request:**
```
GET /v1/noticias-regionais/news?category=transito
```

**Response (payload de `data`):**
```json
[
  {
    "id": "reg-1qxqale",
    "title": "Adolescente atropelado por motociclista sem CNH em Santos recebe alta",
    "source": "Santa Portal",
    "sourceUrl": "https://santaportal.com.br",
    "url": "https://santaportal.com.br/baixada/...",
    "description": "Condutor, de 22 anos, segue internado...",
    "image": "https://santaportal.com.br/wp-content/uploads/2026/08/...",
    "category": "transito",
    "publishedAt": "2026-09-24T23:15:00.000Z"
  }
]
```

**Nota:** a categoria e classificada automaticamente no coletor RSS (`noticias-regionais.repository.classify`) por keyword do titulo/descricao. Cache 30min; `forceRefresh()` re-coleta os feeds (cron 1h).

---

## GET /v1/noticias-regionais/routes

Apenas o status das rodovias regionais (retorna **array** de `TrafficRoute`).

**Query Parameters:** Nenhum

**Exemplo de Request:**
```
GET /v1/noticias-regionais/routes
```

**Response (payload de `data`):**
```json
[
  {
    "id": "sp-222",
    "name": "SP-222",
    "condition": "MODERADO",
    "description": "Trecho de Iguape com fluxo intenso apos enchentes. Alagamentos pontuais em areas rurais",
    "updatedAt": "2026-09-21T12:00:00.000Z"
  },
  {
    "id": "sp-165",
    "name": "SP-165",
    "condition": "INTERROMPIDO",
    "description": "Interditada nos km 88 (Eldorado) e 42,5 e 73 (Sete Barras) apos deslizamentos",
    "updatedAt": "2026-09-21T12:00:00.000Z"
  }
]
```

**Campos:** mesmos de `routes[]` no endpoint pai (`id`, `name`, `condition`, `description`, `updatedAt`). Rotas (5): SP-222, BR-116 (Regis Bittencourt), SP-165, Balsa Cananeia-Ilha Comprida, SP-055.

---

## GET /v1/comercio

Diretorio comercial de Ilha Comprida com 50 estabelecimentos geolocalizados.

**Query Parameters:** Nenhum

**Exemplo de Request:**
```
GET /v1/comercio
```

**Response:**
```json
{
  "commerce": [
    {
      "id": "parada-do-surf",
      "name": "Parada do Surf",
      "sector": "alimentacao",
      "subsector": "Lanchonete",
      "lat": -24.7400,
      "lon": -47.5600,
      "address": "Av. Beira Mar, 20.000 - Aragarças",
      "description": "Lanchonete tematica voltada para surfistas.",
      "phone": "(13) 99770-0927",
      "googleMapsUrl": "https://maps.google.com/?q=-24.7400,-47.5600"
    }
  ],
  "timestamp": "2026-09-11T00:00:00.000Z"
}
```

**Campos do response:**
| Campo | Tipo | Descricao |
|-------|------|-----------|
| commerce[].id | string | ID unico do comercio |
| commerce[].name | string | Nome do estabelecimento |
| commerce[].sector | string | Setor: alimentacao, hospedagem, comercio, servicos, lazer |
| commerce[].subsector | string | Subsetor (ex: Lanchonete, Pousada, Supermercado) |
| commerce[].lat | number | Latitude |
| commerce[].lon | number | Longitude |
| commerce[].address | string | Endereco de referencia |
| commerce[].description | string | Descricao do estabelecimento |
| commerce[].phone | string | Telefone (ou "Nao informado") |
| commerce[].googleMapsUrl | string | Link para Google Maps |

**Setores disponiveis:**
| Setor | Quantidade | Descricao |
|-------|-----------|-----------|
| alimentacao | 15 | Restaurantes, lanchonetes, padarias, bares |
| hospedagem | 13 | Pousadas, hotels, camping, hostels |
| comercio | 12 | Supermercados, lojas, mercados |
| servicos | 6 | Postos, oficinas, lavanderias |
| lazer | 4 | Escolas de surf, ecoturismo, locacao |

---

## GET /v1/comercio/commerce

Comercios em **array plano** (sem envelope `{commerce, timestamp}` do endpoint pai). Com `sector` retorna os filtrados; sem parametro, retorna os 50.

**Query Parameters:**
| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| sector | string | Nao | `alimentacao`, `hospedagem`, `comercio`, `servicos`, `lazer` |

**Exemplo de Request:**
```
GET /v1/comercio/commerce?sector=lazer
```

**Response (payload de `data` — array):**
```json
[
  {
    "id": "escola-de-surf-vale-do-ribeira",
    "name": "Escola de Surf Vale do Ribeira",
    "sector": "lazer",
    "subsector": "Esportes Nauticos",
    "lat": -24.7405,
    "lon": -47.5605,
    "address": "Proximo a Parada do Surf",
    "description": "Ensino de surfe para iniciantes e intermediarios, aluguel de pranchas softboard e aulas particulares.",
    "phone": "(13) 3842-3142",
    "googleMapsUrl": "https://maps.google.com/?q=-24.7405,-47.5605"
  }
]
```

**Campos:** identicos a `commerce[]` do endpoint pai. Setor invalido retorna array vazio (nao 404).

---

## Formato de Erro (ApiEnvelope)

Todos os erros retornam no formato padronizado:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Localizacao nao encontrada"
  }
}
```

**Codigos de erro:**
| Codigo | HTTP Status | Descricao |
|--------|-------------|-----------|
| NOT_FOUND | 404 | Recurso nao encontrado |
| VALIDATION_ERROR | 400 | Parametros invalidos |
| INTERNAL_ERROR | 500 | Erro interno do servidor |
| RATE_LIMITED | 429 | Muitas requisicoes |

---

## Rate Limiting

- `@nestjs/throttler` v6: **60 requisicoes por minuto por IP** (`ttl: 60_000`, `limit: 60` em `app.module.ts`)
- **Loopback isento:** `127.0.0.1` / `::1` (`skipIf`) — dev local e testes nunca recebem 429
- Headers de resposta (quando ativo):
  - `X-RateLimit-Limit`: Limite maximo
  - `X-RateLimit-Remaining`: Requisicoes restantes
  - `X-RateLimit-Reset`: Segundos ate o reset
- Ao exceder: HTTP **429** com header `Retry-After` e corpo no formato ApiEnvelope:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ThrottlerException",
    "message": "ThrottlerException: Too Many Requests"
  }
}
```

---

## CORS

O backend aceita requisicoes do frontend configurado em `FRONTEND_ORIGIN` (default: http://localhost:3000).

---

## Fallback

Quando uma API externa falha, o sistema retorna dados do fallback diario salvo em disco. O frontend mostra o horario da ultima atualizacao para transparencia.

Para forcar atualizacao do fallback, basta aguardar 24h ou reiniciar o backend (que re-busca dados na proxima requisicao).

---

## POST /v1/iron/chat

Rota para envio de mensagens ao agente IA (MeteorBot).

**Headers:**
| Header | Tipo | Obrigatorio | Descricao |
|--------|------|-------------|-----------|
| Content-Type | string | Sim | application/json |

**Request Body:**
```json
{
  "message": "Qual a previsão do tempo amanhã?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "Amanhã em Ilha Comprida...",
    "timestamp": "2026-09-10T14:00:00.000Z"
  }
}
```

---

## GET /v1/cron/status

Retorna o status do agente de refresh automatico.

**Response (payload de `data`):**
```json
{
  "lastRefresh": "2026-09-21T10:00:00.000Z",
  "lastNewsRefresh": "2026-09-21T11:00:00.000Z",
  "isRefreshing": false
}
```

**Campos:**
| Campo | Tipo | Descricao |
|-------|------|-----------|
| lastRefresh | string \| null | Data/hora do ultimo refresh completo (ISO 8601) |
| lastNewsRefresh | string \| null | Data/hora do ultimo refresh leve de noticias (cron 1h) |
| isRefreshing | boolean | Se true, refresh esta em andamento |

---

## POST /v1/cron/refresh

Forca refresh manual de todas as fontes de dados.

**Headers:**
| Header | Tipo | Obrigatorio | Descricao |
|--------|------|-------------|-----------|
| x-cron-secret | string | Sim | Chave de autenticacao (CRON_SECRET) |

**Response (sucesso — envelope externo + payload interno):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "details": {
      "meteorology": "OK",
      "oceanography": "OK",
      "weather-news": "OK",
      "rankings": "OK (15 men, 15 women, 7 events)",
      "news": "OK",
      "regional-news": "OK"
    },
    "duration": 3617
  },
  "error": null
}
```

| Campo (em `data`) | Tipo | Descricao |
|-------|------|-----------|
| success | boolean | `false` se um refresh ja estava em andamento (retorna `details: {}`, `duration: 0`) |
| details.* | string | `OK` / `OK (n men, n women, n events)` ou `ERROR: <motivo>` por modulo |
| duration | number | Duracao total em ms |

**Response (secret invalido — HTTP 200, envelopado):**
```json
{ "success": true, "data": { "error": "Unauthorized", "message": "Invalid CRON_SECRET" }, "error": null }
```

> **Nota:** o controller usa `@HttpCode(200)` para todos os casos, inclusive auth — verifique `data.error` (nao apenas o status HTTP).

---

## Fontes de Dados Externas

> **[LLM_CONTEXT] Gemini API — Migração de Chaves (Set/2026)**
> O Google migrou as chaves de API do Google AI Studio para o Gemini.
> Formato antigo: `AIzaSy...` → Formato novo: `AQ.SUA_CHAVE_AQUI`
> As chaves novas são vinculadas a uma conta de serviço interna do Google Cloud, permitindo controle de acesso mais restrito.
> Para obter uma nova chave: https://aistudio.google.com/apikey
> O endpoint da API continua o mesmo: `https://generativelanguage.googleapis.com/v1beta/models`
> O SDK `@google/genai` aceita ambos os formatos — a mudança é transparente para o código.
> Uses do Gemini no Meteor 2.0: resumo tático de surf (oceanography/summary) e chatbot Irons (iron/chat).

| Fonte | API | Custo | Uso |
|-------|-----|-------|-----|
| Open-Meteo | Forecast API | Gratuita | Previsao do tempo (current, hourly, daily) |
| Open-Meteo | Marine API | Gratuita | Dados de ondas, swell, marees |
| RainViewer | Weather Maps | Gratuita | Radar de precipitacao em tempo real |
| INMET | Avisos | Gratuita | Alertas meteorologicos oficiais |
| CPTEC/INPE | Previsao Numerica | Gratuita | Modelos GFS, ECMWF, COSMO-Brasil |
| Defesa Civil SP | Alertas | Gratuita | Alertas de desastres e cheias |
| Marinha do Brasil | Avisos Maritimos | Gratuita | Alertas costeiros e de mare |
| OpenStreetMap | Tiles | Gratuita | Mapas base (sem API key) |
| OSRM | Routing | Gratuita | Rotas "Como Chegar" (demo server) |

### RainViewer (Radar)
- Endpoint: `https://api.rainviewer.com/public/weather-maps.json`
- Tiles: `https://tilecache.rainviewer.com{path}/512/{z}/{x}/{y}/2/1_1.png`
- Sem necessidade de API key
- Atualizado a cada 10 minutos
