#!/bin/bash
set -e

# ====================================
# LakshPath - Google Cloud Deploy Script
# ====================================
# Requirements:
#   1. Google Cloud CLI (gcloud) installed
#   2. A GCP project with billing enabled ($20 credit)
#   3. A PostgreSQL database URL (Neon free or Cloud SQL)
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh

echo "========================================="
echo "   LakshPath - Production Deployment"
echo "========================================="

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE_NAME="lakshpath"

if [ -z "$PROJECT_ID" ]; then
  echo ""
  echo "Enter your Google Cloud Project ID:"
  read -r PROJECT_ID
fi

if [ -z "$PROJECT_ID" ]; then
  echo "ERROR: Project ID is required"
  exit 1
fi

echo ""
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Step 1: Set project
echo "[1/6] Setting GCP project..."
gcloud config set project "$PROJECT_ID"

# Step 2: Enable required APIs
echo "[2/6] Enabling required APIs..."
gcloud services enable run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  2>/dev/null || true

# Step 3: Create Artifact Registry repo (if not exists)
echo "[3/6] Setting up container registry..."
gcloud artifacts repositories create lakshpath-repo \
  --repository-format=docker \
  --location="$REGION" \
  --description="LakshPath container images" \
  2>/dev/null || true

# Step 4: Build the Docker image
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/lakshpath-repo/${SERVICE_NAME}:latest"

echo "[4/6] Building Docker image..."
echo "  This will take 2-3 minutes..."

# Read env for build args
GOOGLE_CLIENT_ID=$(grep GOOGLE_CLIENT_ID .env.production 2>/dev/null | head -1 | cut -d'"' -f2)

gcloud builds submit \
  --tag "$IMAGE" \
  --timeout=600 \
  --region="$REGION" \
  .

# Step 5: Deploy to Cloud Run
echo "[5/6] Deploying to Cloud Run..."

# Read environment variables from .env.production
ENV_VARS=""
while IFS= read -r line; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "$line" ]] && continue
  # Extract key=value, strip surrounding quotes from value
  key=$(echo "$line" | cut -d'=' -f1)
  value=$(echo "$line" | cut -d'=' -f2- | sed 's/^"//;s/"$//')
  if [ -n "$key" ] && [ -n "$value" ]; then
    if [ -n "$ENV_VARS" ]; then
      ENV_VARS="${ENV_VARS},${key}=${value}"
    else
      ENV_VARS="${key}=${value}"
    fi
  fi
done < .env.production

gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "$ENV_VARS" \
  --timeout 300

# Step 6: Get the URL
echo "[6/6] Getting deployment URL..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)')

echo ""
echo "========================================="
echo "   DEPLOYMENT SUCCESSFUL!"
echo "========================================="
echo ""
echo "  Your app is live at:"
echo "  $SERVICE_URL"
echo ""
echo "  Health check:"
echo "  $SERVICE_URL/health"
echo ""
echo "  IMPORTANT: Update Google OAuth redirect URIs"
echo "  Go to: https://console.cloud.google.com/apis/credentials"
echo "  Add these Authorized redirect URIs:"
echo "    - $SERVICE_URL"
echo "    - $SERVICE_URL/dashboard"
echo ""
echo "  Also add to Authorized JavaScript origins:"
echo "    - $SERVICE_URL"
echo ""
echo "========================================="
