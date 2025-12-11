# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci && \
  npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Accept build argument for API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and config files
COPY . .

# Create public directory if it doesn't exist
RUN mkdir -p public

# Set build-time environment variable
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Copy public assets (create directory first, then copy if exists)
RUN mkdir -p ./public
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]

