#!/bin/bash

set -e

echo "Deploying SheetVault..."

# Configuration
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${APP_DIR}/data"

cd "$APP_DIR"

# Pull latest changes
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Pulling latest changes..."
    git pull origin main
fi

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building..."
npm run build

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"

# Deploy with Docker or PM2
if [ "$1" = "--docker" ]; then
    echo "Deploying with Docker..."
    docker compose down
    docker compose up -d --build
    echo "Docker deployment complete."
elif command -v pm2 &> /dev/null; then
    echo "Deploying with PM2..."
    export DATABASE_PATH="${DATA_DIR}/sheetvault.db"
    export NODE_ENV=production
    pm2 restart sheetvault 2>/dev/null || pm2 start npm --name "sheetvault" -- run start
    pm2 save
    echo "PM2 deployment complete."
else
    echo "No deployment method found."
    echo "Options:"
    echo "  1. Install PM2: npm install -g pm2"
    echo "  2. Use Docker: $0 --docker"
    echo ""
    echo "Starting in foreground mode..."
    export DATABASE_PATH="${DATA_DIR}/sheetvault.db"
    export NODE_ENV=production
    npm run start
fi

echo "Deployment complete!"
