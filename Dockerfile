# Multi-stage Dockerfile for Next.js (App Router) using Debian (glibc)
FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
# Use npm install (not ci) so Linux platform-specific optional deps (e.g., lightningcss native binary)
# are correctly resolved inside the container even if the lockfile was created on macOS.
RUN npm install --no-audit --no-fund

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build with Next in production mode
ENV NEXT_TELEMETRY_DISABLED=1
# Disable Lightning CSS to avoid native binary issues in CI containers
ENV NEXT_DISABLE_LIGHTNINGCSS=1
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

# Copy only necessary folders from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Port for Cloud Run
EXPOSE 8080
ENV PORT=8080

# Next standalone app exposes server.js
USER nextjs
CMD ["node", "server.js"]
