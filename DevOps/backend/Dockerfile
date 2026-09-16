FROM node:22-alpine AS base

RUN npm install -g pnpm@11

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy backend package
COPY apps/backend/package.json apps/backend/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/backend/ apps/backend/

# Build backend
RUN cd apps/backend && pnpm build

# Production stage
FROM node:22-alpine AS production

RUN npm install -g pnpm@11

WORKDIR /app

COPY --from=base /app/apps/backend/dist ./dist
COPY --from=base /app/apps/backend/package.json ./
COPY --from=base /app/apps/backend/data ./data
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main.js"]
