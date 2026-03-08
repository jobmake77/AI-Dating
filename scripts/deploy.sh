#!/bin/bash

# Deploy script for AI-Dating application
# Usage: ./scripts/deploy.sh [environment]
# Environment: production (default) or staging

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting deployment to $ENVIRONMENT..."

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env_vars() {
  echo "📋 Checking environment variables..."

  REQUIRED_VARS=(
    "VERCEL_TOKEN"
    "VERCEL_ORG_ID"
    "VERCEL_PROJECT_ID"
  )

  for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
      echo -e "${RED}❌ Error: $var is not set${NC}"
      exit 1
    fi
  done

  echo -e "${GREEN}✅ All required environment variables are set${NC}"
}

# Run tests
run_tests() {
  echo "🧪 Running tests..."

  cd "$PROJECT_ROOT"

  if npm run test:run; then
    echo -e "${GREEN}✅ Tests passed${NC}"
  else
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
  fi
}

# Build application
build_app() {
  echo "🔨 Building application..."

  cd "$PROJECT_ROOT"

  if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
  else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
  fi
}

# Deploy to Vercel
deploy_to_vercel() {
  echo "🚢 Deploying to Vercel ($ENVIRONMENT)..."

  cd "$PROJECT_ROOT"

  if [ "$ENVIRONMENT" = "production" ]; then
    DEPLOY_ARGS="--prod"
  else
    DEPLOY_ARGS=""
  fi

  if command -v vercel &> /dev/null; then
    DEPLOY_URL=$(vercel $DEPLOY_ARGS --token="$VERCEL_TOKEN" 2>&1 | grep -o 'https://[^ ]*' | tail -1)
    echo -e "${GREEN}✅ Deployed to: $DEPLOY_URL${NC}"
    echo "$DEPLOY_URL" > "$PROJECT_ROOT/.deploy-url"
  else
    echo -e "${RED}❌ Vercel CLI not found. Please install it: npm i -g vercel${NC}"
    exit 1
  fi
}

# Health check
health_check() {
  echo "🏥 Running health check..."

  if [ -f "$PROJECT_ROOT/.deploy-url" ]; then
    DEPLOY_URL=$(cat "$PROJECT_ROOT/.deploy-url")
    HEALTH_URL="$DEPLOY_URL/api/health"

    echo "Checking: $HEALTH_URL"

    MAX_RETRIES=5
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

      if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        return 0
      fi

      RETRY_COUNT=$((RETRY_COUNT + 1))
      echo -e "${YELLOW}⏳ Health check failed (attempt $RETRY_COUNT/$MAX_RETRIES), retrying in 10s...${NC}"
      sleep 10
    done

    echo -e "${RED}❌ Health check failed after $MAX_RETRIES attempts${NC}"
    exit 1
  else
    echo -e "${YELLOW}⚠️  Deploy URL not found, skipping health check${NC}"
  fi
}

# Main deployment flow
main() {
  echo "================================"
  echo "  AI-Dating Deployment Script"
  echo "  Environment: $ENVIRONMENT"
  echo "================================"
  echo ""

  check_env_vars
  run_tests
  build_app
  deploy_to_vercel
  health_check

  echo ""
  echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
  echo ""

  if [ -f "$PROJECT_ROOT/.deploy-url" ]; then
    DEPLOY_URL=$(cat "$PROJECT_ROOT/.deploy-url")
    echo "🔗 Deployment URL: $DEPLOY_URL"
  fi
}

main
