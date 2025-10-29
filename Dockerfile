# =============================================================================
# Multi-stage Dockerfile for Peakees E-commerce Platform
# Optimized for production deployment with security and performance in mind
# =============================================================================

# Stage 1: Dependencies (cached layer)
FROM node:20-alpine AS deps
WORKDIR /app

# Install security updates
RUN apk upgrade --no-cache && \
    apk add --no-cache libc6-compat dumb-init

# Copy package files
COPY package*.json ./

# Install dependencies with exact versions for reproducible builds
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Stage 2: Build (development dependencies + build)
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Runtime (minimal production image)
FROM node:20-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init && \
    apk upgrade --no-cache

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy runtime dependencies from deps stage
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=40s --retries=3 \
    CMD node healthcheck.js || exit 1

# Create healthcheck script
RUN echo 'const http = require("http"); \
const options = { \
  host: "localhost", \
  port: process.env.PORT || 3000, \
  path: "/api/health", \
  timeout: 2000 \
}; \
const request = http.request(options, (res) => { \
  console.log(`STATUS: ${res.statusCode}`); \
  process.exitCode = (res.statusCode === 200) ? 0 : 1; \
  process.exit(); \
}); \
request.on("error", (err) => { \
  console.log("ERROR", err); \
  process.exit(1); \
}); \
request.end();' > healthcheck.js

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]

# Security labels
LABEL maintainer="Peakees Team" \
      org.opencontainers.image.title="Peakees E-commerce Platform" \
      org.opencontainers.image.description="Production-ready Next.js e-commerce application" \
      org.opencontainers.image.vendor="Peakees" \
      org.opencontainers.image.licenses="Private" \
      security.scan="enabled"