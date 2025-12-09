#!/bin/bash

# Skitt Frontend - Docker Quick Start Script

set -e

echo "🚀 Starting Skitt Frontend Containerization..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file from .env.local.example (if exists)..."
    if [ -f .env.local.example ]; then
        cp .env.local.example .env.local
        echo "✅ .env.local file created. Please review and update if needed."
    else
        echo "⚠️  No .env.local.example found. You may need to create .env.local manually."
    fi
    echo ""
fi

# Build images
echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check service health
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Skitt Frontend is starting up!"
echo ""
echo "📍 Access your services:"
echo "   Frontend:  http://localhost:4000"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""

