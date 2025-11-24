#!/bin/bash

# Script to start both backend (NestJS) and frontend (Angular) servers

echo "Starting backend and frontend servers..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to catch Ctrl+C
trap cleanup INT TERM

# Start backend in background
echo "Starting NestJS backend..."
(cd backend && npm run start:dev) &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start frontend in background
echo "Starting Angular frontend..."
(cd frontend && npx ng serve) &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "Both servers are starting..."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "=========================================="
echo ""
echo "Backend will run on: http://localhost:3000"
echo "Frontend will run on: http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
