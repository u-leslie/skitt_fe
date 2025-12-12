#!/bin/bash
set -e

# Get the directory where this script is located (k8s folder)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

NAMESPACE=${1:-skitt-prod}

echo "🚀 Deploying Skitt Frontend to Kubernetes namespace: $NAMESPACE"

# Apply namespace
echo "📦 Creating namespace..."
kubectl apply -f "$SCRIPT_DIR/namespace.yaml"

# Apply secrets from file
echo "🔐 Applying secrets..."
if [ -f "$SCRIPT_DIR/secret.yaml" ]; then
  kubectl apply -f "$SCRIPT_DIR/secret.yaml"
  echo "✅ Secrets applied from secret.yaml"
else
  echo "⚠️  Warning: secret.yaml not found!"
  echo "   Please create $SCRIPT_DIR/secret.yaml with your API URL"
  echo "   You can copy from $SCRIPT_DIR/secret.yaml.example as a template"
  exit 1
fi

# Apply ConfigMap
echo "📝 Creating ConfigMap..."
kubectl apply -f "$SCRIPT_DIR/configmap.yaml"

# Apply Deployment
echo "🚀 Creating Deployment..."
kubectl apply -f "$SCRIPT_DIR/deployment.yaml"

# Apply Service
echo "🌐 Creating Service..."
kubectl apply -f "$SCRIPT_DIR/service.yaml"

# Apply HPA
echo "📈 Creating Horizontal Pod Autoscaler..."
kubectl apply -f "$SCRIPT_DIR/hpa.yaml"

# Wait for deployment
echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/skitt-frontend -n $NAMESPACE

echo ""
echo "✅ Frontend deployment complete!"
echo ""
echo "📊 Check status:"
echo "   kubectl get pods -n $NAMESPACE"
echo "   kubectl get services -n $NAMESPACE"
echo ""
echo "📝 View logs:"
echo "   kubectl logs -f deployment/skitt-frontend -n $NAMESPACE"
