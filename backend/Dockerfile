FROM node:20-alpine

WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm ci --production=false

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Create data directory for SQLite
RUN mkdir -p /app/data

# Cleanup dev dependencies
RUN npm prune --production

ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_URL="file:/app/data/lakshpath.db"

EXPOSE 8080

# Push schema to create DB tables, then start
CMD ["sh", "-c", "npx prisma db push --skip-generate 2>/dev/null; node dist/server.js"]
