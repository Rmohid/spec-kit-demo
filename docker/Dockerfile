FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist/ ./dist/

# Create data directory
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/taskflow.db

# Create non-root user
RUN addgroup -g 1001 -S taskflow && \
    adduser -S taskflow -u 1001 -G taskflow && \
    chown -R taskflow:taskflow /app

USER taskflow

# Set entrypoint
ENTRYPOINT ["node", "dist/cli/index.js"]

# Default command (show help)
CMD ["--help"]
