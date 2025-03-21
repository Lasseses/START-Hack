# Base on Node 18 LTS (includes npm)
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies including required packages for shadcn/ui
RUN npm ci
RUN npm install uuid clsx tailwind-merge class-variance-authority

# Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure lib directory and utils.ts exist with correct contents
RUN mkdir -p lib
RUN echo 'import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}' > lib/utils.ts

# Verify the file exists
RUN ls -la lib/
RUN cat lib/utils.ts

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_PATH=/app/node_modules
ENV PATH=$PATH:/app/node_modules/.bin

# Build Next.js app
RUN npm cache clean --force
RUN ls -la
RUN ls -la lib/
RUN npm run build

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