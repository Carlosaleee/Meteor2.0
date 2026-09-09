# Guia do Desenvolvedor — Meteor 2.0

## Pre-requisitos

- Node.js 20+ (recomendado: 22 LTS)
- pnpm 11+
- Git

## Setup Inicial

```bash
# Clonar o repositorio
git clone https://github.com/Carlosaleee/Meteor2.0.git
cd Meteor2.0

# Instalar dependencias
pnpm install

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas chaves (opcional para dados basicos)

# Criar .env.local no frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > apps/frontend/.env.local
```

## Como Rodar

### Backend (Terminal 1)
```bash
cd apps/backend
npm run dev
# Acessa em http://localhost:3001
# Health check: http://localhost:3001/health
```

### Frontend (Terminal 2)
```bash
cd apps/frontend
npm run dev
# Acessa em http://localhost:3000
```

## Comandos Uteis

```bash
# Build completo (todos os apps)
pnpm build

# Lint (todos os apps)
pnpm lint

# Testes (todos os apps)
pnpm test

# Formatacao
pnpm format
```

## Estrutura do Projeto

```
Meteor_2.0/
  apps/
    backend/           # API NestJS
      src/
        common/        # Servicos compartilhados (fallback, http, config)
        modules/       # Modulos de dominio (meteorology, oceanography, traffic)
        data/          # JSONs de fallback (gitignored)
    frontend/          # App Next.js
      src/
        app/           # Paginas (8 rotas)
        components/    # Componentes React
        hooks/         # Hooks customizados
        lib/           # Utilitarios (api.ts)
  especificacoes/      # Documentacao do projeto
  DESIGN.md            # Design system tokens
```

## Padroes de Codigo

### Componentes (Frontend)
- Arquivos em `src/app/` sao paginas (rotas)
- Componentes reutilizaveis em `src/components/`
- Hooks customizados em `src/hooks/`
- Utilitarios em `src/lib/`

### Backend
- Padrao 3 camadas: Controller > Service > Repository
- Controllers: rotas HTTP
- Services: logica de negocio
- Repositories: acesso a dados (APIs externas + fallback)
- FallbackService: compartilhado via modulo global

### Estilizacao
- Tailwind CSS v4 (sem tailwind.config.js)
- Design tokens em `globals.css` via `@theme` + `[data-theme="light"]`
- CSS custom properties para Header, Footer, Nav (dark + light)
- Padrao visual: slate-900, rounded-2xl, border-slate-800
- Icones: React Icons (Font Awesome) — `react-icons/fa`
- Tema: dark/light com `localStorage` + `prefers-color-scheme`
- Linha dourada: `var(--color-gold-line)` #E0B429 (dark) / #C49A1A (light)

## Convencoes de Commit

Padrao Conventional Commits:
```
tipo(escopo): descricao curta

Exemplos:
feat(noticias): adiciona pagina de noticias regionais
fix(meteorology): corrige fallback para localizacao invalida
chore: atualiza dependencias
```

Tipos: feat, fix, docs, style, refactor, test, chore, ci

## Fluxo de Trabalho

1. Criar branch a partir da `main`:
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. Implementar e commitar:
   ```bash
   git add .
   git commit -m "feat(novo): descricao"
   ```

3. Push para o remoto:
   ```bash
   git push origin feature/nome-da-feature
   ```

4. Criar Pull Request para `main`

5. Apos aprovacao, merge na `main`

**NUNCA** commitar direto na `main`.

## Variaveis de Ambiente

### Backend (.env)
```
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
FALLBACK_DIR=data
FALLBACK_MAX_AGE_HOURS=24
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Debugging

### Backend
- Logs aparecem no terminal do `npm run dev`
- Erros retornam no formato ApiEnvelope: `{ success, data, error }`
- Health check: `GET /health`

### Frontend
- Erros de compilacao aparecem no browser
- Dados da API: abrir Network tab > `/v1/meteorology`
- Mapas: verificar console por erros Leaflet

## Troubleshooting

### Erro "Map container is already initialized"
- Reiniciar o dev server
- O projeto usa cleanup via `map.remove()` no useEffect

### Erro "NEXT_PUBLIC_API_URL is not defined"
- Verificar se `apps/frontend/.env.local` existe
- Conteudo: `NEXT_PUBLIC_API_URL=http://localhost:3001`

### Fallbacks sempre retornando dados antigos
- Verificar se `apps/backend/data/` existe
- Os JSONs sao criados automaticamente na primeira requisicao bem-sucedida

## Padrões de UI

### Componentes React (Icones)
- Icones: React Icons (Font Awesome) — `react-icons/fa`
- Exemplo: `import { FaHome, FaCloudSun } from 'react-icons/fa'`
- Substituiu Lucide React na branch `feature/header-footer-icons`

### Header
- Imagem de capa: `next/image` com `width={3328} height={1248}` + `object-contain`
- Toggle idioma: `FaGlobe` + `PT-BR`/`ES`
- Toggle tema: `FaSun`/`FaMoon` + `Claro`/`Escuro`
- Linha dourada: `<div className="h-1 w-full bg-[var(--color-gold-line)]" />`

### Nav Bar (Responsiva)
- Desktop: `hidden md:flex` — horizontal centrado
- Mobile: Hamburger (`FaBars`/`FaTimes`) com dropdown
- Hover dourado: `hover:bg-[var(--color-nav-hover-bg)] hover:text-[var(--color-nav-hover-text)]`
- Pagina ativa: `border-b-2 border-[var(--color-gold)]` (desktop) / `border-l-2` (mobile)
- Auto-close: `useEffect(() => setMenuOpen(false), [pathname])`

### Footer (4 Colunas)
- Grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`
- Colunas: Branding | Desenvolvedor | Fontes | Stack
- Linha dourada no topo
- Links externos: `FaExternalLinkAlt` no hover

### Acessibilidade
- Skip-link: `<a href="#main-content" className="skip-link sr-only">`
- `role="banner"` (header), `role="navigation"` (nav), `role="contentinfo"` (footer)
- `role="menubar"` / `role="menuitem"` nos links
- `aria-current="page"` na pagina ativa
- `aria-expanded` / `aria-controls` no hamburger
- `aria-pressed` nos botoes de toggle
- `aria-hidden="true"` em icones decorativos
- `focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]` em todos os interativos

### Tema Dark/Light
- CSS variables em `globals.css`: `@theme` (dark) + `[data-theme="light"]` (light)
- Persistencia: `localStorage.setItem('meteor-theme', theme)`
- Deteccao: `window.matchMedia('(prefers-color-scheme: light)')`
- Aplicacao: `document.documentElement.setAttribute('data-theme', 'light')`
- Componentes usam `var(--color-*)` em vez de hardcoded
