#!/bin/bash
set -e

echo "🚀 Deploying Skitt Frontend to EC2"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file in the frontend directory with:"
    echo "  NODE_ENV=production"
    echo "  PORT=4000"
    echo "  NEXT_PUBLIC_API_URL=http://your-backend-ip:3001"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker: sudo systemctl start docker"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Build using docker directly (more reliable than docker-compose build)
echo "📦 Building frontend container..."
docker build -t skitt-frontend:latest --target runner -f Dockerfile .

# Start using docker-compose (it will use the built image)
echo "🚀 Starting frontend service..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for frontend to be healthy..."
sleep 15

# Check frontend health
echo "🏥 Checking frontend health..."
if curl -f http://localhost:4000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
    echo ""
    echo "📋 Frontend is running at:"
    echo "  URL: http://$(curl -s ifconfig.me):4000"
else
    echo "⚠️  Frontend health check failed"
    echo "Check logs: docker-compose logs -f"
    exit 1
fi

echo ""
echo "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 Stop service: docker-compose -f docker-compose.prod.yml down"
