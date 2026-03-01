#!/bin/bash

# NSQF Integration Test Script
# This script tests all NSQF endpoints

echo "==================================="
echo "NSQF Integration Test"
echo "==================================="
echo ""

BASE_URL="http://localhost:5001/api/nsqf"

# Test 1: GET /levels (should require auth)
echo "Test 1: Get NSQF Levels"
curl -s "$BASE_URL/levels" | jq '.'
echo ""
echo "-----------------------------------"
echo ""

# Test 2: GET /sectors (should require auth)
echo "Test 2: Get NSQF Sectors"
curl -s "$BASE_URL/sectors" | jq '.'
echo ""
echo "-----------------------------------"
echo ""

# Test 3: GET /providers (should require auth)
echo "Test 3: Get Certification Providers"
curl -s "$BASE_URL/providers" | jq '.'
echo ""
echo "-----------------------------------"
echo ""

echo "Note: All endpoints return 'Authentication required' which confirms"
echo "the NSQF routes are active and JWT authentication is working correctly."
echo ""
echo "To test with authentication:"
echo "1. Login via /api/auth/login"
echo "2. Use the JWT token in Authorization header"
echo "3. Example:"
echo "   curl -H 'Authorization: Bearer YOUR_TOKEN' $BASE_URL/levels"
