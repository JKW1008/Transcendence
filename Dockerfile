# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source files
COPY . .

# Build the app (client + server)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/index.html ./

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the SSR server
CMD ["node", "server.js"]
