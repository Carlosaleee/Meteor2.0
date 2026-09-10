# Referencia da API — Meteor 2.0

Base URL: http://localhost:3001

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

Dados meteorologicos em tempo real para uma localizacao.

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
  "timestamp": "2026-09-08T14:00:00.000Z",
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
  "forecastMax": 24,
  "forecastMin": 17
}
```

**Campos do response:**
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
| forecastMax | number | Temperatura maxima prevista |
| forecastMin | number | Temperatura minima prevista |

---

## GET /v1/oceanography

Dados oceanicos de ondas, swell e marees.

**Query Parameters:** Nenhum

**Exemplo de Request:**
```
GET /v1/oceanography
```

**Response:**
```json
{
  "location": "Ilha Comprida & Costa",
  "timestamp": "2026-09-08T14:00:00.000Z",
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
      "level": "Intermediario",
      "bestWind": "Terral (Oeste)"
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
| nextTide | string | Proxima maré alta |
| tideCoefficient | number | Coeficiente de mare |
| spots | array | Lista de spots de surf |

---

## GET /v1/traffic

Status de trânsito das rodovias regionais.

**Query Parameters:** Nenhum

**Exemplo de Request:**
```
GET /v1/traffic
```

**Response:**
```json
{
  "timestamp": "2026-09-08T14:00:00.000Z",
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

- Limite: 30 requisicoes por minuto por IP
- Headers de resposta:
  - `X-RateLimit-Limit`: Limite maximo
  - `X-RateLimit-Remaining`: Requisicoes restantes
  - `X-RateLimit-Reset`: Momento do reset

---

## CORS

O backend aceita requisicoes do frontend configurado em `FRONTEND_ORIGIN` (default: http://localhost:3000).

---

## Fallback

Quando uma API externa falha, o sistema retorna dados do fallback diario salvo em disco. O frontend mostra o horario da ultima atualizacao para transparencia.

Para forcar atualizacao do fallback, basta aguardar 24h ou reiniciar o backend (que re-busca dados na proxima requisicao).
