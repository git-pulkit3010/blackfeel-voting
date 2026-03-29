#!/bin/bash

# BlackFeel Voting App - Start Script
# Starts both the auth backend and voting frontend

set -e

echo "🚀 Starting BlackFeel Voting App..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if in correct directory
if [ ! -f "package.json" ] || [ ! -d "blackfeel-auth" ]; then
    echo "❌ Please run this script from the root of blackfeel-voting directory"
    exit 1
fi

# Check if backend venv exists
if [ ! -d "blackfeel-auth/backend/venv" ]; then
    echo "❌ Backend virtual environment not found. Run ./setup.sh first."
    exit 1
fi

# Start backend in background
echo -e "${YELLOW}→ Starting auth backend on port 8000...${NC}"
cd blackfeel-auth/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
sleep 3

# Start frontend
echo -e "${YELLOW}→ Starting voting app on port 3000...${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✓ Both servers started!${NC}"
echo ""
echo "Backend:  http://127.0.0.1:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
