#!/bin/bash

echo "========================================"
echo " IoT Posture Monitoring System Setup"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js is installed: $(node --version)"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "WARNING: MongoDB might not be running"
    echo "Please start MongoDB service or install from https://www.mongodb.com/"
    echo
fi

echo
echo "Installing dependencies..."
npm run install-all

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "Setting up environment files..."
if [ ! -f "backend/.env" ]; then
    cp "backend/.env.example" "backend/.env"
    echo "Created backend/.env from example"
fi

if [ ! -f "frontend/.env" ]; then
    cp "frontend/.env.example" "frontend/.env"
    echo "Created frontend/.env from example"
fi

echo
echo "========================================"
echo " Starting the application..."
echo "========================================"
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:5000"
echo
echo "Press Ctrl+C to stop the application"
echo

npm start