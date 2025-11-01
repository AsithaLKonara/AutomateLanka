#!/bin/bash

echo "🚀 Deploying AutomateLanka to Vercel"
echo "========================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"
echo ""

# Check if we're deploying frontend only or need backend setup
echo "⚠️  IMPORTANT: Backend Deployment"
echo ""
echo "Your backend (Express + SQLite) needs to be deployed separately."
echo "Recommended options:"
echo "  1. Railway.app (easiest) - https://railway.app"
echo "  2. Render.com - https://render.com"
echo "  3. Fly.io - https://fly.io"
echo ""
echo "After deploying backend, add its URL to Vercel environment variables:"
echo "  NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com"
echo ""

read -p "Have you deployed the backend? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 Deploy backend first, then run this script again."
    echo ""
    echo "Quick Railway deployment:"
    echo "  cd apps/backend"
    echo "  railway init"
    echo "  railway up"
    echo ""
    exit 1
fi

echo ""
read -p "Enter your backend URL (e.g., https://yourapp.railway.app): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL is required"
    exit 1
fi

echo ""
echo "📝 Setting up environment for Vercel..."

# Create production env file
cat > apps/frontend/.env.production << EOF
NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL
BACKEND_URL=$BACKEND_URL
EOF

echo "✅ Environment configured"
echo ""

# Deploy to Vercel
echo "🚀 Deploying frontend to Vercel..."
echo ""
cd apps/frontend

vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Visit your Vercel dashboard"
echo "  2. Set environment variable: NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL"
echo "  3. Redeploy if needed"
echo ""

