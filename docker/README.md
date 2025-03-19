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
   - Build the web container with Nginx
   - Build the API container with Rust
   - Start a PostgreSQL database
   - Connect all services together

4. **Verify deployment**

   Once deployed, you can access:
   - Web interface: http://localhost
   - API: http://localhost/api

## Configuration

### Nginx Configuration

The web server uses Nginx with a custom configuration located at `docker/nginx.conf`. This configuration:

- Serves the frontend application
- Routes API requests to the backend
- Handles SPA routing
- Sets up caching for static assets

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

For production deployment, consider:

1. Using a proper secrets management solution instead of environment variables
2. Setting up SSL certificates for HTTPS
3. Implementing proper database backup procedures
4. Using a container orchestration platform like Kubernetes
