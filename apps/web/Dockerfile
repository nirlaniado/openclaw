FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app

COPY apps/web apps/web
COPY packages/shared packages/shared

ENV NEXT_PUBLIC_APP_NAME="Nutrition Tracker"
ENV NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ENV NEXT_PUBLIC_SUPABASE_URL="http://localhost:54321"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="container-build-placeholder"
ENV LLM_PROVIDER="stub"
ENV LOG_LEVEL="info"
ENV BUILD_STANDALONE="true"

RUN pnpm --filter web build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV="production"
ENV PORT="3000"
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
