# Base on Node 18 LTS (includes npm)
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# If you use yarn or pnpm, copy their lock files too
# COPY package.json yarn.lock* ./
# COPY package.json pnpm-lock.yaml* ./

# Install dependencies including uuid
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js app
RUN npm run build

# If using standalone output in next.config.js, uncomment these lines instead:
# ENV NEXT_OUTPUT_STANDALONE true
# RUN npm run build

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

# Set environment variables for runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user to run the app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy built application
COPY --from=builder /app/public ./public
# Copy the entire .next directory
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Set the correct permission for prerender cache
RUN mkdir -p .next/cache
RUN chown -R nextjs:nodejs .next

# Expose port
EXPOSE 3000

# Set server startup command
CMD ["npm", "run", "start"]