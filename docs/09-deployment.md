# Deployment

> Packaging and deploying TaskFlow CLI

## Deployment Options

TaskFlow CLI can be deployed in several ways:

| Method | Use Case | Complexity |
|--------|----------|------------|
| npm global | Development, personal use | Low |
| Docker | Production, isolation | Medium |
| Binary | Distribution | Medium |

## Option 1: npm Global Install

### Building for npm

```bash
# Build the project
npm run build

# Link globally for testing
npm link

# Now available globally
taskflow --version
```

### Publishing to npm

```bash
# Update version in package.json
npm version patch  # or minor, major

# Build and publish
npm run build
npm publish
```

Users can then install:
```bash
npm install -g taskflow-cli
```

## Option 2: Docker Deployment

### Dockerfile

```dockerfile
# docker/Dockerfile

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files
COPY --from=builder /app/dist ./dist

# Create data directory
RUN mkdir -p /app/data

# Set environment
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/taskflow.db

# Entry point
ENTRYPOINT ["node", "dist/cli/index.js"]
```

### docker-compose.yml

```yaml
# docker/docker-compose.yml

version: '3.8'

services:
  taskflow:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    volumes:
      - taskflow-data:/app/data
    environment:
      - DATABASE_PATH=/app/data/taskflow.db
      - LOG_LEVEL=info

volumes:
  taskflow-data:
```

### Building and Running

```bash
# Build the image
cd docker
docker build -t taskflow-cli:latest -f Dockerfile ..

# Run a command
docker run --rm taskflow-cli:latest --help
docker run --rm taskflow-cli:latest task list

# With persistent data
docker run --rm -v taskflow-data:/app/data taskflow-cli:latest task create "Test"
docker run --rm -v taskflow-data:/app/data taskflow-cli:latest task list

# Using docker-compose
docker-compose build
docker-compose run --rm taskflow task list
```

### Creating an Alias

For convenience, create a shell alias:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias taskflow='docker run --rm -v taskflow-data:/app/data taskflow-cli:latest'

# Now use normally
taskflow task create "Docker task"
taskflow task list
```

## Option 3: Standalone Binary

Using `pkg` to create standalone executables:

### Setup

```bash
npm install -g pkg
```

### Configuration

Add to `package.json`:

```json
{
  "pkg": {
    "scripts": "dist/**/*.js",
    "targets": [
      "node20-linux-x64",
      "node20-macos-x64",
      "node20-win-x64"
    ],
    "outputPath": "bin"
  }
}
```

### Building Binaries

```bash
# Build the project first
npm run build

# Create binaries
pkg .

# Output in bin/
ls bin/
# taskflow-linux
# taskflow-macos
# taskflow-win.exe
```

### Distribution

```bash
# Create release archive
tar -czvf taskflow-linux-x64.tar.gz bin/taskflow-linux
tar -czvf taskflow-macos-x64.tar.gz bin/taskflow-macos
zip taskflow-win-x64.zip bin/taskflow-win.exe
```

## Environment Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_PATH` | `./data/taskflow.db` | SQLite database location |
| `LOG_LEVEL` | `info` | Logging level (error, warn, info, debug) |
| `NODE_ENV` | `development` | Environment mode |

### .env File

```bash
# .env.example

# Database
DATABASE_PATH=./data/taskflow.db

# Logging
LOG_LEVEL=info

# Reasoning Agent
REASONING_MAX_ITERATIONS=10
REASONING_TIMEOUT_MS=30000
```

### Production Configuration

```bash
# .env.production

DATABASE_PATH=/var/lib/taskflow/taskflow.db
LOG_LEVEL=warn
NODE_ENV=production
REASONING_MAX_ITERATIONS=5
REASONING_TIMEOUT_MS=15000
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/release.yml

name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Build Docker image
        run: |
          docker build -t taskflow-cli:${{ github.ref_name }} -f docker/Dockerfile .
          
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push taskflow-cli:${{ github.ref_name }}
```

## Health Checks

### Docker Health Check

Add to Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node dist/cli/index.js --version || exit 1
```

### Application Health

```bash
# Verify database is accessible
taskflow task list > /dev/null && echo "Healthy" || echo "Unhealthy"
```

## Logging in Production

### Log Format

```typescript
// Winston configuration for production

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Output:
// {"level":"info","message":"Task created","taskId":"abc123","timestamp":"2025-01-01T12:00:00.000Z"}
```

### Log Rotation

```typescript
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/taskflow-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
});
```

## Backup and Recovery

### Database Backup

```bash
# Backup SQLite database
cp /app/data/taskflow.db /backup/taskflow-$(date +%Y%m%d).db

# Or use SQLite backup command
sqlite3 /app/data/taskflow.db ".backup /backup/taskflow.db"
```

### Automated Backup Script

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR=/backup
DB_PATH=/app/data/taskflow.db
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
sqlite3 "$DB_PATH" ".backup $BACKUP_DIR/taskflow-$DATE.db"

# Keep only last 7 days
find "$BACKUP_DIR" -name "taskflow-*.db" -mtime +7 -delete

echo "Backup complete: taskflow-$DATE.db"
```

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables configured
- [ ] Database path is persistent
- [ ] Logging configured for production
- [ ] Health check verified
- [ ] Backup strategy in place
- [ ] Docker image tagged with version

## Troubleshooting

### Database Issues

```bash
# Check database file exists
ls -la /app/data/taskflow.db

# Check database integrity
sqlite3 /app/data/taskflow.db "PRAGMA integrity_check;"

# Check permissions
ls -la /app/data/
```

### Container Issues

```bash
# View logs
docker logs <container_id>

# Interactive shell
docker run -it --entrypoint /bin/sh taskflow-cli:latest

# Check environment
docker run --rm taskflow-cli:latest env
```

### Performance Issues

```bash
# Check database size
ls -lh /app/data/taskflow.db

# Vacuum database
sqlite3 /app/data/taskflow.db "VACUUM;"

# Check for slow queries
LOG_LEVEL=debug taskflow task list
```

## Next Steps

- Review [PIPELINE-GUIDE.md](../PIPELINE-GUIDE.md) for full development workflow
- Check [WORKBOOK.md](../WORKBOOK.md) for hands-on exercises

---

**Production Tip**: Always test your deployment in a staging environment that mirrors production before going live.
