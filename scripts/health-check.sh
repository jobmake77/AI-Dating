#!/bin/bash

# Health Check Script for AI-Dating
# Usage: ./scripts/health-check.sh [url]

set -e

# Default URL
URL="${1:-https://aidating.com}"
HEALTH_URL="$URL/api/health"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================"
echo "  AI-Dating Health Check"
echo "================================"
echo ""
echo "Checking: $HEALTH_URL"
echo ""

# Perform health check
RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL" 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Check if curl succeeded
if [ -z "$HTTP_CODE" ] || [ "$HTTP_CODE" = "000" ]; then
  echo -e "${RED}❌ Failed to connect to $HEALTH_URL${NC}"
  echo "Please check if the URL is correct and the service is running."
  exit 1
fi

# Parse response
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Health check passed (HTTP $HTTP_CODE)${NC}"
  echo ""

  # Check if jq is available
  if command -v jq &> /dev/null; then
    echo "Response:"
    echo "$BODY" | jq '.'

    # Extract specific fields
    STATUS=$(echo "$BODY" | jq -r '.status')
    DB_STATUS=$(echo "$BODY" | jq -r '.checks.database.status')
    DB_RESPONSE_TIME=$(echo "$BODY" | jq -r '.checks.database.responseTime')
    VERSION=$(echo "$BODY" | jq -r '.version')
    ENVIRONMENT=$(echo "$BODY" | jq -r '.environment')

    echo ""
    echo "Summary:"
    echo "  Status: $STATUS"
    echo "  Database: $DB_STATUS ($DB_RESPONSE_TIME)"
    echo "  Version: $VERSION"
    echo "  Environment: $ENVIRONMENT"
  else
    echo "Response:"
    echo "$BODY"
    echo ""
    echo "Tip: Install jq for better output formatting: brew install jq"
  fi

  exit 0
else
  echo -e "${RED}❌ Health check failed (HTTP $HTTP_CODE)${NC}"
  echo ""
  echo "Response:"
  echo "$BODY"
  exit 1
fi
