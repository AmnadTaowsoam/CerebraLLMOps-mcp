FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm + tsx globally so resolution doesn't depend on hoist quirks
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate \
 && npm install -g tsx@4.22.3

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml ./
COPY apps/llmops-api/package.json ./apps/llmops-api/

# Install dependencies (--shamefully-hoist so tsx resolves under /app/node_modules)
RUN pnpm install --frozen-lockfile --ignore-scripts --shamefully-hoist 2>/dev/null \
 || pnpm install --ignore-scripts --shamefully-hoist

# Copy source
COPY apps/llmops-api/ ./apps/llmops-api/
COPY migrations/ ./migrations/

WORKDIR /app/apps/llmops-api

EXPOSE 4300

# Use globally installed tsx — pnpm hoist symlinks can break with workspace:* refs.
CMD ["tsx", "src/index.ts"]
