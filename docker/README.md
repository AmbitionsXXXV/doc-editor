# Docker Deployment Guide

This guide explains how to deploy the document editor application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git repository cloned to your local machine

## Deployment Steps

1. **Build the application**

   First, build the frontend application:

   ```bash
   # From the project root
   cd apps/web
   npm install
   npm run build
   ```

2. **Configure environment variables**

   Copy the example environment file and modify as needed:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file to set the appropriate values for your environment.

3. **Deploy with Docker Compose**

   From the project root, run:

   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

   This will:
   - Build the web container with Caddy
   - Build the API container with Rust
   - Start a PostgreSQL database
   - Connect all services together

4. **Verify deployment**

   Once deployed, you can access:
   - Web interface: http://localhost
   - API: http://localhost/api

## Configuration

### Caddy Configuration

The web server uses Caddy with a custom configuration located at `docker/Caddyfile`. This configuration:

- Serves the frontend application
- Routes API requests to the backend
- Handles SPA routing
- Sets up compression and caching for static assets
- Provides automatic HTTPS in production environments

### Environment Variables

Key environment variables:

- `API_URL`: URL for the API service
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation

## Troubleshooting

### Logs

View container logs:

```bash
docker compose -f docker/docker-compose.yml logs -f
```

For a specific service:

```bash
docker compose -f docker/docker-compose.yml logs -f web
```

### Common Issues

1. **Web app shows "Cannot connect to API" error**
   - Check if the API container is running
   - Verify the API_URL environment variable

2. **Database connection errors**
   - Check PostgreSQL container is running
   - Verify DATABASE_URL environment variable
   - Ensure the database has been initialized

## Production Deployment

For production deployment with Caddy:

1. Update the Caddyfile with your domain information (Caddy will automatically provision HTTPS certificates)
2. Ensure ports 80 and 443 are exposed to the internet
3. Consider using a proper secrets management solution instead of environment variables
4. Implement proper database backup procedures
5. Consider using a container orchestration platform like Kubernetes
