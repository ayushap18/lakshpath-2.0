# ── Stage 1: Backend build ──
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# ── Stage 2: Frontend build ──
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Vite reads .env.production at build time; write it explicitly
# to avoid issues with Docker ARG / Cloud Build / upload exclusions.
# These values are PUBLIC (exposed in the browser bundle).
RUN printf '%s\n' \
    'VITE_API_BASE_URL=/api' \
    'VITE_GOOGLE_CLIENT_ID=336426317494-0q8g121u3e6qglp3c14vge0hdmfgrgg1.apps.googleusercontent.com' \
    > .env.production && cat .env.production
RUN npm run build

# ── Stage 3: Production image ──
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache dumb-init

# Copy backend build
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/package.json ./
COPY --from=backend-build /app/backend/prisma ./prisma

# Copy frontend static files into backend's public dir
COPY --from=frontend-build /app/frontend/dist ./public

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

# Run migrations then start server
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy 2>/dev/null || npx prisma db push --skip-generate 2>/dev/null || true && node dist/server.js"]
