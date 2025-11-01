#!/bin/bash

# Setup script for Node.js + Next.js migration
echo "🚀 Setting up AutomateLanka with Node.js + Next.js"
echo "=================================================="

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

PNPM_VERSION=$(pnpm -v)
echo "✅ pnpm version: $PNPM_VERSION"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p database
mkdir -p workflows

# Setup environment files
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="file:./database/workflows.db"
WORKFLOW_DB_PATH="database/workflows.db"

# Backend Server
PORT=8000
HOST=0.0.0.0
NODE_ENV=development

# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000

# Security
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-change-in-production

# Features
ENABLE_ANALYTICS=true
ENABLE_MARKETPLACE=true
ENABLE_AI_RECOMMENDATIONS=true
EOF
    echo "✅ .env file created"
fi

# Setup backend .env
if [ ! -f apps/backend/.env ]; then
    echo ""
    echo "⚙️  Creating backend .env file..."
    cat > apps/backend/.env << 'EOF'
PORT=8000
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL="file:../../database/workflows.db"
WORKFLOW_DB_PATH="../../database/workflows.db"
EOF
    echo "✅ Backend .env file created"
fi

# Setup frontend .env
if [ ! -f apps/frontend/.env.local ]; then
    echo ""
    echo "⚙️  Creating frontend .env.local file..."
    cat > apps/frontend/.env.local << 'EOF'
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
EOF
    echo "✅ Frontend .env.local file created"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "  1. Index workflows: cd apps/backend && pnpm run index-workflows"
echo "  2. Start backend:   cd apps/backend && pnpm dev"
echo "  3. Start frontend:  cd apps/frontend && pnpm dev"
echo ""
echo "Or run both together: pnpm dev"
echo ""

