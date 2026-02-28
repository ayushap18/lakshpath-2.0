#!/bin/bash
set -e

echo "========================================="
echo "   LakshPath - Local Development Setup"
echo "========================================="
echo ""

# Step 1: Check for PostgreSQL DATABASE_URL
if grep -q "file:./dev.db" backend/.env 2>/dev/null; then
  echo "WARNING: Your backend/.env still uses SQLite (file:./dev.db)"
  echo ""
  echo "LakshPath now uses PostgreSQL. You need a PostgreSQL connection string."
  echo ""
  echo "EASIEST OPTION - Neon (free, 30 seconds):"
  echo "  1. Go to https://neon.tech and sign up (free)"
  echo "  2. Create a project named 'lakshpath'"
  echo "  3. Copy the connection string"
  echo "  4. Update backend/.env:"
  echo '     DATABASE_URL="postgresql://user:pass@host/lakshpath?sslmode=require"'
  echo ""
  echo "Then run this script again."
  exit 1
fi

echo "[1/4] Installing backend dependencies..."
cd backend && npm install
echo ""

echo "[2/4] Generating Prisma client..."
npx prisma generate
echo ""

echo "[3/4] Running database migrations..."
npx prisma migrate deploy
echo ""

echo "[4/4] Installing frontend dependencies..."
cd ../frontend && npm install
echo ""

echo "========================================="
echo "   Setup complete! Start with:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo "========================================="
