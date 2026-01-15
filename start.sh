#!/bin/bash

# RTSP Livestream Overlay - Quick Start Script (Unix/macOS/Linux)

echo "🎥 RTSP Livestream Overlay - Starting Application"
echo "=================================================="
echo ""

# Check if MongoDB is running
echo "Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "Please start MongoDB in a separate terminal:"
    echo "  mongod"
    echo ""
    read -p "Press Enter when MongoDB is running..."
fi

# Start backend
echo ""
echo "Starting Backend Server..."
cd backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Start backend in background
python app.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
sleep 3

# Start frontend
echo ""
echo "Starting Frontend..."
cd ../frontend

# Start frontend in background
npm start &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "=================================================="
echo "🚀 Application Started Successfully!"
echo "=================================================="
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Services stopped'; exit 0" INT

# Keep script running
wait
