
#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Production Deployment Process..."

# 1. Verification
echo "🔍 Checking Environment..."
if [ ! -f "apps/backend/.env.production" ]; then
    echo "❌ Error: apps/backend/.env.production not found!"
    exit 1
fi

if [ ! -f "apps/frontend/.env.production" ]; then
    echo "❌ Error: apps/frontend/.env.production not found!"
    exit 1
fi

echo "✅ Environment files found."

# 2. Database Migration (Optional - usually done in CI/CD, but good for verify)
# We need to use the production env for this.
echo "🐘 Verifying Database..."
# Exporting vars for the verification script
export $(cat apps/backend/.env.production | grep -v '^#' | xargs)

# Run verification script
npx tsx scripts/verify-db-connection.ts

echo "🔄 Running Database Migrations..."
cd apps/backend
# execute prisma migrate deploy using the prod env
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
cd ../..

# 3. Build Backend
echo "🛠️  Building Backend..."
cd apps/backend
npm run build
cd ../..

# 4. Build Frontend
echo "🎨 Building Frontend..."
cd apps/frontend
# Next.js build needs env vars available at build time for client-side bundling
# We verify if we can build it. 
# Note: In Vercel, this is handled by Vercel's build system. 
# Locally, we simulate it.
# We assume .env.production is loaded by Next.js if NODE_ENV=production, 
# OR we verify if we need to load it manually.
# Next.js loads .env.production automatically.
npm run build
cd ../..

echo "🎉 Deployment Build Verification Complete!"
echo "   - Backend built in apps/backend/dist"
echo "   - Frontend built in apps/frontend/.next"
