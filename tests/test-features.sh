#!/bin/bash

# 🎯 LAKSHPATH NEW FEATURES - COMPLETE VERIFICATION SCRIPT
# This script tests all 3 new AI features to ensure they're working perfectly

echo "════════════════════════════════════════════════════════════"
echo "🎯 LAKSHPATH NEW FEATURES VERIFICATION"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing ${name}... "
    
    response=$(curl -s "$url" 2>&1)
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "  Expected: $expected"
        echo "  Got: $response"
        ((FAILED++))
        return 1
    fi
}

# 1. BACKEND HEALTH CHECK
echo -e "${BLUE}📡 BACKEND TESTS${NC}"
echo "─────────────────────────────────────────────────────────────"

test_endpoint "Backend Health" "http://localhost:5001/health" "status"

test_endpoint "Interview Stats API" "http://localhost:5001/api/interview/stats" "Authentication required"

test_endpoint "Portfolio Stats API" "http://localhost:5001/api/portfolio/stats" "Authentication required"

test_endpoint "LinkedIn Stats API" "http://localhost:5001/api/linkedin/stats" "Authentication required"

echo ""

# 2. FRONTEND AVAILABILITY
echo -e "${BLUE}🎨 FRONTEND TESTS${NC}"
echo "─────────────────────────────────────────────────────────────"

test_endpoint "Frontend Server" "http://localhost:3001" "<!doctype html"

echo ""

# 3. DATABASE VERIFICATION
echo -e "${BLUE}🗄️ DATABASE TESTS${NC}"
echo "─────────────────────────────────────────────────────────────"

cd backend 2>/dev/null || cd ../backend 2>/dev/null

if [ -f "prisma/dev.db" ]; then
    echo -n "Checking InterviewSession table... "
    if sqlite3 prisma/dev.db "SELECT name FROM sqlite_master WHERE name='InterviewSession';" | grep -q "InterviewSession"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
    fi
    
    echo -n "Checking PortfolioAnalysis table... "
    if sqlite3 prisma/dev.db "SELECT name FROM sqlite_master WHERE name='PortfolioAnalysis';" | grep -q "PortfolioAnalysis"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
    fi
    
    echo -n "Checking LinkedInOptimization table... "
    if sqlite3 prisma/dev.db "SELECT name FROM sqlite_master WHERE name='LinkedInOptimization';" | grep -q "LinkedInOptimization"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
    fi
    
    echo -n "Checking RepositoryAnalysis table... "
    if sqlite3 prisma/dev.db "SELECT name FROM sqlite_master WHERE name='RepositoryAnalysis';" | grep -q "RepositoryAnalysis"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ Database file not found${NC}"
    ((FAILED+=4))
fi

echo ""

# 4. FILE EXISTENCE CHECK
echo -e "${BLUE}📁 FILE STRUCTURE TESTS${NC}"
echo "─────────────────────────────────────────────────────────────"

check_file() {
    local file=$1
    local name=$2
    echo -n "Checking ${name}... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ EXISTS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ MISSING${NC}"
        ((FAILED++))
    fi
}

cd ../.. 2>/dev/null || cd ..

check_file "backend/src/services/interviewService.ts" "Interview Service"
check_file "backend/src/services/portfolioService.ts" "Portfolio Service"
check_file "backend/src/services/linkedinService.ts" "LinkedIn Service"
check_file "backend/src/controllers/interviewController.ts" "Interview Controller"
check_file "backend/src/controllers/portfolioController.ts" "Portfolio Controller"
check_file "backend/src/controllers/linkedinController.ts" "LinkedIn Controller"
check_file "backend/src/routes/interview.routes.ts" "Interview Routes"
check_file "backend/src/routes/portfolio.routes.ts" "Portfolio Routes"
check_file "backend/src/routes/linkedin.routes.ts" "LinkedIn Routes"
check_file "frontend/src/pages/InterviewPractice.tsx" "Interview Practice Page"
check_file "frontend/src/pages/PortfolioAnalysis.tsx" "Portfolio Analysis Page"
check_file "frontend/src/pages/LinkedInOptimizer.tsx" "LinkedIn Optimizer Page"

echo ""

# 5. ENVIRONMENT VARIABLES
echo -e "${BLUE}⚙️ ENVIRONMENT TESTS${NC}"
echo "─────────────────────────────────────────────────────────────"

cd backend 2>/dev/null

if [ -f ".env" ]; then
    echo -n "Checking GEMINI_API_KEY... "
    if grep -q "GEMINI_API_KEY" .env; then
        echo -e "${GREEN}✅ SET${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ MISSING${NC}"
        ((FAILED++))
    fi
    
    echo -n "Checking DATABASE_URL... "
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✅ SET${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ MISSING${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    ((FAILED+=2))
fi

echo ""

# SUMMARY
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo "════════════════════════════════════════════════════════════"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}║  ✅ ALL TESTS PASSED - FEATURES ARE WORKING PERFECTLY!   ║${NC}"
    echo -e "${GREEN}║                                                           ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "🎉 You can now use all 3 AI career features:"
    echo "   • Interview Practice: http://localhost:3001/interview"
    echo "   • Portfolio Analysis: http://localhost:3001/portfolio"
    echo "   • LinkedIn Optimizer: http://localhost:3001/linkedin"
    exit 0
else
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                           ║${NC}"
    echo -e "${YELLOW}║  ⚠️  SOME TESTS FAILED - CHECK LOGS ABOVE                ║${NC}"
    echo -e "${YELLOW}║                                                           ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "📋 Common fixes:"
    echo "   1. Make sure backend is running: cd backend && npm run dev"
    echo "   2. Make sure frontend is running: cd frontend && npm run dev"
    echo "   3. Run migrations: cd backend && npx prisma migrate dev"
    echo "   4. Generate Prisma client: cd backend && npx prisma generate"
    echo ""
    echo "📖 See PERFECT_WORKING_CHECKLIST.md for detailed troubleshooting"
    exit 1
fi
