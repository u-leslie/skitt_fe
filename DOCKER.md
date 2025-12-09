# 🐳 Skitt Frontend - Docker Guide

Complete guide for running the Skitt Frontend using Docker.

## 📋 Prerequisites

- **Docker Engine** 20.10 or higher
- **Docker Compose** 2.0 or higher
- **Backend API** running (see backend Docker guide)

Verify installation:
```bash
docker --version
docker-compose --version
```

## 🚀 Quick Start

### Option 1: Using the Start Script (Recommended)

```bash
cd frontend
./docker-start.sh
```

This script will:
- Check if Docker is running
- Create `.env.local` file if needed
- Build Docker images
- Start the frontend service
- Show service status

### Option 2: Manual Docker Compose

```bash
cd frontend

# Build and start service
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

## 📁 Docker Files

- `docker-compose.yml` - Production setup
- `docker-compose.dev.yml` - Development setup with hot reload
- `docker-start.sh` - Quick start script
- `Dockerfile` - Multi-stage build configuration

## 🏗️ Architecture

```
┌─────────────┐
│  Frontend   │ (Next.js - Port 4000)
│  Container  │
└──────┬──────┘
       │
       │ HTTP
       │
┌──────▼──────┐
│  Backend    │ (Express API - Port 3001)
│    API      │ (Must be running separately)
└─────────────┘
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Important**: 
- If backend is running in Docker on the same machine, use `http://localhost:3001`
- If backend is on a different machine, use the full URL (e.g., `http://192.168.1.100:3001`)
- For Docker Compose, you can also set this in `docker-compose.yml` environment section

### Default Values

If `.env.local` is not provided, Docker Compose uses:
- `NEXT_PUBLIC_API_URL`: `http://localhost:3001`
- `PORT`: `4000`

## 🎯 Running Modes

### Production Mode (Docker)

Runs frontend in a container:

```bash
docker-compose up -d
```

**Service:**
- Frontend: `http://localhost:4000`

**Prerequisites:**
- Backend API must be running and accessible at the configured URL

### Development Mode

#### Option A: Docker with Hot Reload

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This runs the frontend in development mode with:
- Hot module replacement
- Source code mounted as volume
- Faster rebuilds

#### Option B: Local Development

```bash
# Start frontend locally
npm install
npm run dev
```

**Benefits:**
- Fastest development cycle
- Direct access to logs
- No Docker overhead

## 📊 Common Commands

### Start Service
```bash
docker-compose up -d
```

### Stop Service
```bash
docker-compose down
```

### View Logs
```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Check Service Status
```bash
docker-compose ps
```

### Rebuild After Code Changes
```bash
# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Rebuild all (no cache)
docker-compose build --no-cache
docker-compose up -d
```

### Access Container Shell
```bash
docker exec -it skitt-frontend sh
```

### Development Mode with Hot Reload
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## 🔍 Health Checks

The frontend includes a health check that verifies the service is responding.

View health status:
```bash
docker-compose ps
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 4000
lsof -i :4000

# Kill process or change port in docker-compose.yml
```

### Frontend Not Starting

```bash
# Check logs
docker-compose logs frontend

# Rebuild
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Cannot Connect to Backend API

**Symptoms:**
- Network errors in browser console
- API calls failing
- 404 or connection refused errors

**Solutions:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check environment variable:**
   ```bash
   # In container
   docker exec skitt-frontend env | grep NEXT_PUBLIC_API_URL
   ```

3. **Update API URL:**
   - Edit `.env.local` or `docker-compose.yml`
   - Rebuild: `docker-compose up -d --build`

4. **If backend is in Docker:**
   - Use `http://host.docker.internal:3001` (Mac/Windows)
   - Or use the host machine's IP address
   - Or connect both services to the same Docker network

### Build Failures

```bash
# Clean build (no cache)
docker-compose build --no-cache

# Remove old images
docker system prune -a

# Clear Next.js cache
docker-compose down
docker volume prune
docker-compose up -d --build
```

### Permission Issues

```bash
# Fix permissions (Linux/Mac)
sudo chown -R $USER:$USER .
```

### Container Won't Start

```bash
# Check container status
docker ps -a

# View container logs
docker logs skitt-frontend

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Next.js Build Errors

```bash
# Clear .next directory
docker exec skitt-frontend rm -rf .next

# Rebuild
docker-compose restart frontend
```

## 🔗 Connecting to Backend

### Backend on Same Machine

If backend is running on the same machine (Docker or local):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend in Docker on Same Machine

If both are in Docker, you can:

1. **Use host.docker.internal** (Mac/Windows):
   ```env
   NEXT_PUBLIC_API_URL=http://host.docker.internal:3001
   ```

2. **Use Docker network** (Recommended):
   - Connect both services to the same network
   - Use service name as hostname
   - Update `docker-compose.yml` to join backend network

3. **Use host IP address**:
   ```env
   NEXT_PUBLIC_API_URL=http://192.168.1.100:3001
   ```

### Backend on Different Machine

```env
NEXT_PUBLIC_API_URL=http://backend-server-ip:3001
```

## 📈 Resource Usage

### Check Container Stats
```bash
docker stats skitt-frontend
```

### Check Disk Usage
```bash
docker system df
```

### Clean Up Unused Resources
```bash
# Remove stopped containers, unused networks, images
docker system prune

# Remove everything (⚠️ aggressive)
docker system prune -a
```

## 🔒 Security Best Practices

✅ **Implemented:**
- Non-root user in containers
- Multi-stage builds (minimal attack surface)
- Health checks
- Environment variables for configuration

⚠️ **Production Recommendations:**
- Use HTTPS in production
- Set proper CORS headers
- Regular security updates
- Resource limits
- Network isolation

## 🧪 Testing

### Test Frontend Locally

```bash
# Build and test
npm run build
npm start
```

### Test in Docker

```bash
# Build and run
docker-compose up -d

# Check if accessible
curl http://localhost:4000
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Next.js Documentation](https://nextjs.org/docs)

## 🆘 Getting Help

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify Docker is running: `docker info`
3. Check service health: `docker-compose ps`
4. Verify backend is accessible: `curl http://localhost:3001/health`
5. Review environment variables in `.env.local`

## 🔄 Development Workflow

### Recommended Setup

1. **Backend in Docker:**
   ```bash
   cd ../backend
   docker-compose up -d
   ```

2. **Frontend locally:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

This gives you:
- Fastest development cycle
- Hot reload for both services
- Easy debugging
- Direct log access

### Alternative: Both in Docker

1. **Backend:**
   ```bash
   cd ../backend
   docker-compose up -d
   ```

2. **Frontend:**
   ```bash
   cd frontend
   docker-compose -f docker-compose.dev.yml up -d
   ```

