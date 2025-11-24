# Production Dockerfile for NestJS Server
# Multi-stage build for optimal image size and security

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat && \
    npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts .

# Install dependencies with cache mount
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Stage 2: Builder with Prisma Generation
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat && \
    npm install -g pnpm
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy source files and prisma schema
COPY . .

# Generate Prisma Client in builder stage (after dependencies installed)
# Use a dummy DATABASE_URL for generation since we don't need actual DB connection
RUN DATABASE_URL="postgresql://user:password@localhost:5432/dummy" pnpm exec prisma generate

# Ensure all dependencies are properly installed (includes Prisma runtime utilities)
RUN pnpm install --frozen-lockfile

# Build application
RUN pnpm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy necessary files from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma.config.ts .

# Create uploads directory for file storage
RUN mkdir -p ./uploads && \
    chown -R nestjs:nodejs ./uploads

USER nestjs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Start application (migrations run separately via docker exec)
CMD ["node", "dist/main"]
