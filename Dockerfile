# Frontend Dockerfile
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY pulsecollab/package*.json ./
RUN npm ci --only=production

COPY pulsecollab/ ./
RUN npm run build

# Backend Dockerfile
FROM node:18-alpine AS backend-build

WORKDIR /app/backend
COPY pulsecollab_backend/package*.json ./
RUN npm ci --only=production

COPY pulsecollab_backend/ ./

# Production stage
FROM node:18-alpine AS production

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend ./backend

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create uploads directory
RUN mkdir -p uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV FRONTEND_PORT=3000

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
