#!/bin/bash
set -e

# Get the directory where this script is located (k8s folder)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Parent directory is the frontend root
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔨 Building frontend Docker image..."
cd "$FRONTEND_DIR"

# Get the directory where this script is located (k8s folder)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Read NEXT_PUBLIC_API_URL from secret.yaml
if [ ! -f "$SCRIPT_DIR/secret.yaml" ]; then
    echo "⚠️  Error: $SCRIPT_DIR/secret.yaml not found!"
    echo "   Please create it from $SCRIPT_DIR/secret.yaml.example"
    echo "   Example: cp $SCRIPT_DIR/secret.yaml.example $SCRIPT_DIR/secret.yaml"
    exit 1
fi

# Extract NEXT_PUBLIC_API_URL from secret.yaml
NEXT_PUBLIC_API_URL=$(grep "NEXT_PUBLIC_API_URL:" "$SCRIPT_DIR/secret.yaml" | sed 's/.*NEXT_PUBLIC_API_URL: *"\(.*\)"/\1/')

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "⚠️  Error: Could not find NEXT_PUBLIC_API_URL in $SCRIPT_DIR/secret.yaml"
    exit 1
fi

echo "Building with NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
docker build \
  --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
  -t skitt-frontend:latest \
  --target runner \
  -f Dockerfile .

echo "🚀 Deploying to Kubernetes..."
cd "$SCRIPT_DIR"
./deploy.sh

echo ""
echo "✅ Frontend built and deployed!"
echo "📊 Check status: kubectl get pods -n skitt-prod"
