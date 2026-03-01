#!/bin/bash
# Test enhanced GitHub analyzer with a real user

# First, let's test with a simple GitHub user (torvalds - creator of Linux)
USERNAME="torvalds"

echo "Testing Enhanced GitHub Analyzer for: $USERNAME"
echo "========================================="
echo ""
echo "Features being tested:"
echo "- Authored fork detection (filters empty forks)"
echo "- GitHub achievement badge validation"
echo "- Enhanced AI scoring (10 parameters)"
echo "- Project ideas generation"
echo "- Developer type inference"
echo ""
echo "Note: You need to be logged in to test this"
echo ""
echo "Sample curl command:"
echo ""
echo "curl -X POST http://localhost:5001/api/portfolio/analyze \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "  -d '{\"githubUsername\": \"$USERNAME\", \"targetRole\": \"Software Engineer\"}'"
