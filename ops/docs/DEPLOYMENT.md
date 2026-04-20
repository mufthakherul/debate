# Operations Documentation

## Deployment Guide

### Prerequisites
- Docker and Docker Compose
- Node.js 20+
- PostgreSQL 16+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/mufthakherul/debate.git
   cd debate
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp api/.env.example api/.env
   cp web/.env.example web/.env
   ```

3. **Start services with Docker**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   ```

   For local development with live reload:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   ```

4. **Run database migrations**
   ```bash
   cd api
   npm install
   npx prisma migrate dev
   ```

### Manual Setup (without Docker)

1. **Start PostgreSQL**
   - Ensure PostgreSQL is running on port 5432
   - Create database: `debate_db`

2. **Set up API**
   ```bash
   cd api
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

3. **Set up Web**
   ```bash
   cd web
   npm install
   npm run dev
   ```

### Production Deployment

1. **Build for production**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   ```

> Note: The development stack is available with `docker-compose.dev.yml` and does not override the production configuration unless explicitly specified.

2. **Deploy to server**
   - Use your preferred cloud provider (AWS, Azure, GCP, etc.)
   - Ensure environment variables are properly configured
   - Set `NODE_ENV=production` and secure secrets
   - Set up SSL/TLS certificates
   - Configure reverse proxy (nginx/traefik)

### Monitoring

- Health check endpoint: `GET /api/health`
- Check logs: `docker compose logs -f`

### Backup & Recovery

1. **Database backup**
   ```bash
   docker exec debate-postgres pg_dump -U debate_user debate_db > backup.sql
   ```

2. **Database restore**
   ```bash
   docker exec -i debate-postgres psql -U debate_user debate_db < backup.sql
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Check if ports 3000, 8000, 5432 are available
   - Modify docker-compose.yml if needed

2. **Database connection issues**
   - Verify DATABASE_URL in api/.env
   - Check PostgreSQL container status: `docker compose ps`

3. **Build failures**
   - Clear node_modules: `rm -rf */node_modules`
   - Clear Docker cache: `docker compose down -v`
