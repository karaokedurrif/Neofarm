#!/bin/bash

echo "🥚 OvoSfera Hub - Pre-Deployment Checklist"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: .env.local exists
echo -n "1. Checking .env.local... "
if [ -f ".env.local" ]; then
    if grep -q "REPLICATE_API_TOKEN=r8_" .env.local; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${YELLOW}⚠ WARNING: REPLICATE_API_TOKEN no configurado${NC}"
    fi
else
    echo -e "${RED}✗ FALTA - Copiar .env.local.example a .env.local${NC}"
fi

# Check 2: Ports available
echo -n "2. Checking port 3003... "
if ! lsof -Pi :3003 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Available${NC}"
else
    echo -e "${RED}✗ OCUPADO${NC}"
fi

echo -n "3. Checking port 8004... "
if ! lsof -Pi :8004 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Available${NC}"
else
    echo -e "${RED}✗ OCUPADO${NC}"
fi

echo -n "4. Checking port 5436... "
if ! lsof -Pi :5436 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Available${NC}"
else
    echo -e "${RED}✗ OCUPADO${NC}"
fi

# Check 3: Docker running
echo -n "5. Checking Docker... "
if docker info >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ NOT RUNNING${NC}"
fi

# Check 4: Files exist
echo -n "6. Checking docker-compose.yml... "
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ MISSING${NC}"
fi

echo -n "7. Checking start-web.sh executable... "
if [ -x "start-web.sh" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ Run: chmod +x start-web.sh${NC}"
fi

# Check 5: Critical pages exist
echo -n "8. Checking dashboard page... "
if [ -f "apps/web/src/app/dashboard/page.tsx" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ MISSING${NC}"
fi

echo -n "9. Checking simulator page (LA JOYA)... "
if [ -f "apps/web/src/app/simulator/page.tsx" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ MISSING${NC}"
fi

echo -n "10. Checking Replicate API route... "
if [ -f "apps/web/src/app/api/simulate-bird/route.ts" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ MISSING${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo "Next steps:"
echo "1. Verify .env.local has REPLICATE_API_TOKEN"
echo "2. Run: docker compose up -d"
echo "3. Wait ~30s for deps to install"
echo "4. Access: http://localhost:3003/dashboard"
echo ""
echo "Full deployment guide: DEPLOYMENT.md"
echo "=========================================="
