# DevOps - Meteor 2.0

Guia de deploy e infraestrutura do projeto Meteor 2.0.

## Estrutura

```
DevOps/
├── frontend/          # Configurações Vercel (Frontend)
├── backend/           # Configurações deploy (Backend)
├── github-actions/    # CI/CD pipeline
└── env/               # Variáveis de ambiente
```

---

## Deploy do Frontend (Vercel)

### Pré-requisitos
- Conta no Vercel vinculada ao GitHub
- Projeto `meteor2-0-frontend` criado no Vercel

### Configuração

1. **Importar repositório** no Vercel
2. **Configurar variáveis de ambiente** em Settings > Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://meteor2-0-backend.vercel.app
   ```
3. **Configurar build**:
   - Root Directory: `apps/frontend`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

### Arquivos de referência
- `DevOps/frontend/vercel.json` — Configuração Vercel
- `DevOps/frontend/.vercelignore` — Arquivos ignorados

---

## Deploy do Backend

### Opção 1: Railway (Recomendada — Stateful)

O backend usa filesystem para fallback (`data/*.json`), por isso Railway é a opção recomendada.

1. Criar conta no [Railway](https://railway.app)
2. Criar novo projeto
3. Conectar ao repositório GitHub
4. Configurar variáveis de ambiente (copiar de `DevOps/env/.env.backend.example`)
5. Railway detecta automaticamente o `railway.json`

**Configuração:**
- Build: Dockerfile em `DevOps/backend/Dockerfile`
- Porta: 3001
- Health check: `/health`

### Opção 2: Render (Alternativa — Stateful)

1. Criar conta no [Render](https://render.com)
2. Criar novo Web Service
3. Conectar ao repositório GitHub
4. Configurações:
   - Build Command: `pnpm install && cd apps/backend && pnpm build`
   - Start Command: `cd apps/backend && node dist/main.js`
   - Health Check Path: `/health`
5. Adicionar variáveis de ambiente (copiar de `DevOps/env/.env.backend.example`)

### Opção 3: Vercel Serverless (Alternativa — Stateless)

> ⚠️ **Atenção:** O Vercel serverless NÃO suporta filesystem. O sistema de fallback será desabilitado.

1. Criar projeto `meteor2-0-backend` no Vercel
2. Configurar build:
   - Root Directory: `apps/backend`
   - Build Command: `pnpm install && pnpm build`
   - Output Directory: `dist`
3. Copiar `DevOps/backend/vercel.json` para `apps/backend/vercel.json`
4. Copiar `DevOps/backend/api/index.ts` para `apps/backend/api/index.ts`
5. Instalar dependências serverless:
   ```bash
   cd apps/backend
   pnpm add @nestjs/platform-fastify @vercel/node
   ```

**Limitações:**
- Fallback desabilitado (apenas APIs externas)
- Timeout de 10s por requisição
- Cold start possível

---

## CI/CD (GitHub Actions)

O pipeline está configurado em `DevOps/github-actions/ci.yml`.

### Jobs

| Job | Descrição | Trigger |
|-----|-----------|---------|
| `backend-test` | Roda Jest (backend) | push/PR |
| `frontend-test` | Roda Vitest (frontend) | push/PR |
| `lint` | Lint backend + frontend | push/PR |
| `build` | Valida compilação | Após todos os testes passarem |

### Ativação

Copiar `DevOps/github-actions/ci.yml` para `.github/workflows/ci.yml`:

```bash
mkdir -p .github/workflows
cp DevOps/github-actions/ci.yml .github/workflows/ci.yml
```

---

## Variáveis de Ambiente

### Frontend (Vercel)

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://meteor2-0-backend.vercel.app` | URL da API backend |

### Backend (Railway/Render)

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `PORT` | `3001` | Porta do servidor |
| `FRONTEND_ORIGIN` | `https://meteor2-0-frontend.vercel.app` | CORS origin |
| `NODE_ENV` | `production` | Ambiente |
| `GEMINI_API_KEY` | *(sua chave)* | Chave da API Gemini |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Modelo Gemini |
| `GEMINI_TEMPERATURE` | `0.7` | Temperatura Gemini |
| `GEMINI_API_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/models` | URL base Gemini |
| `FALLBACK_DIR` | `data` | Diretório de fallback |
| `FALLBACK_MAX_AGE_HOURS` | `24` | Idade máxima do fallback |

---

## URLs de Produção

| Serviço | URL |
|---------|-----|
| Frontend | `https://meteor2-0-frontend.vercel.app` |
| Backend | `https://meteor2-0-backend.vercel.app` (Vercel) ou URL do Railway/Render |
| Health Check | `https://<backend-url>/health` |

---

## Troubleshooting

### Backend não conecta ao Frontend
- Verificar se `FRONTEND_ORIGIN` está correto no backend
- Verificar CORS: o backend deve aceitar a origem do frontend

### Fallback não funciona no Vercel
- **Esperado:** Vercel serverless é stateless
- **Solução:** Usar Railway/Render para o backend, ou desabilitar fallback

### Build falha no Vercel
- Verificar se `pnpm install --frozen-lockfile` funciona localmente
- Verificar se a versão do Node.js é 22+
- Verificar logs do build no painel Vercel

### CI/CD não roda
- Verificar se o arquivo `.github/workflows/ci.yml` existe
- Verificar permissões do GitHub Actions no repositório
