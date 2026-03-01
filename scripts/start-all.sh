#!/bin/bash

echo "🚀 Starting LakshPath Development Environment..."
echo ""

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000,5001 | xargs kill -9 2>/dev/null
sleep 1

# Start backend
echo "🔧 Starting Backend (Port 5001)..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

# Check backend
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ Backend running on http://localhost:5001"
else
    echo "❌ Backend failed to start"
    cat backend.log
    exit 1
fi

# Start frontend
echo "🎨 Starting Frontend (Port 3000)..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 3

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend running on http://localhost:3000"
else
    echo "❌ Frontend failed to start"
    cat frontend.log
    exit 1
fi

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📱 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo "   API:      http://localhost:5001/api"
echo ""
echo "📋 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "🛑 To stop all services, run: lsof -ti:3000,5001 | xargs kill -9"
echo ""
