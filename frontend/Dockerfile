# Stage 1: Build React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application code
COPY frontend/public ./public
COPY frontend/src ./src
COPY frontend/server.js ./

# Build the application
RUN npm run build

# Stage 2: Production with Nginx
FROM node:18-alpine

WORKDIR /app

# Install Nginx
RUN apk add --no-cache nginx curl

# Copy built files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package*.json ./

# Copy Nginx configuration
COPY frontend/nginx.conf /etc/nginx/nginx.conf
COPY frontend/default.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Change ownership
RUN chown -R nodejs:nodejs /app /var/run/nginx /var/log/nginx

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start application
CMD ["node", "server.js"]
