#!/bin/bash

# GTM Email Enrichment Tool - Startup Script
# This script starts both the backend server and frontend client

echo "=========================================="
echo "🚀 Starting GTM Email Enrichment Tool"
echo "=========================================="
echo ""

# Check if dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo ""
echo "✅ Dependencies installed"
echo ""
echo "Starting servers..."
echo "  - Backend: http://localhost:5001"
echo "  - Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=========================================="
echo ""

# Start backend server in background
cd server
npm run dev &
SERVER_PID=$!
cd ..

# Give server time to start
sleep 2

# Start frontend server
cd client
npm run dev &
CLIENT_PID=$!
cd ..

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup INT TERM

# Wait for both processes
wait
