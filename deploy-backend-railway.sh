#!/bin/bash

echo "🚂 Deploying Backend to Railway"
echo "=================================="
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "✅ Railway CLI ready"
echo ""

echo "📝 This will deploy your backend (Express + SQLite) to Railway"
echo ""
echo "Prerequisites:"
echo "  ✅ Railway account (free tier available)"
echo "  ✅ GitHub account"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

cd apps/backend

echo ""
echo "🔐 Login to Railway..."
railway login

echo ""
echo "🚀 Initializing Railway project..."
railway init

echo ""
echo "⬆️  Deploying to Railway..."
railway up

echo ""
echo "🎉 Backend deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Get your backend URL from Railway dashboard"
echo "  2. Add environment variables in Railway:"
echo "     - PORT=8000"
echo "     - NODE_ENV=production"
echo "  3. Run ./deploy-vercel.sh to deploy frontend"
echo ""
echo "Your backend URL will be something like:"
echo "  https://your-project-name.up.railway.app"
echo ""

