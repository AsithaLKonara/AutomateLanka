# ⚡ Quick Start Guide - Node.js Version

## 🚀 Get Started in 3 Steps

### Step 1: Setup

```bash
# Run the setup script
./setup-node.sh
```

This installs dependencies and creates configuration files.

### Step 2: Index Workflows

```bash
cd apps/backend
pnpm run index-workflows
```

This indexes all 2,057+ workflows into the database.

### Step 3: Start Servers

```bash
# From project root
pnpm dev
```

This starts both backend (port 8000) and frontend (port 3000).

## 🌐 Access Points

Once running:

- **Frontend Home:** http://localhost:3000
- **N8N Workflows Browser:** http://localhost:3000/n8n-workflows
- **Backend API:** http://localhost:8000/api/workflows
- **API Stats:** http://localhost:8000/api/workflows/stats

## 🎯 What You Can Do

### 1. Browse Workflows
Visit http://localhost:3000/n8n-workflows to:
- Search 2,057+ workflows
- Filter by trigger type (Webhook, Scheduled, etc.)
- Filter by complexity (Low, Medium, High)
- Toggle active/inactive workflows
- Download any workflow as JSON

### 2. Use the API

```bash
# Search workflows
curl "http://localhost:8000/api/workflows?q=slack"

# Get statistics
curl "http://localhost:8000/api/workflows/stats"

# Get specific workflow
curl "http://localhost:8000/api/workflows/filename.json"

# Download workflow
curl "http://localhost:8000/api/workflows/filename.json/download"
```

### 3. Integrate with Your App

```typescript
// Fetch workflows in your app
const response = await fetch('http://localhost:8000/api/workflows?q=webhook&per_page=10')
const data = await response.json()

console.log(data.workflows) // Array of workflows
console.log(data.total)     // Total count
console.log(data.pages)     // Total pages
```

## 📁 Key Files

- `apps/backend/src/server.ts` - Express server
- `apps/backend/src/services/workflowDatabase.ts` - Database service
- `apps/backend/src/routes/workflows.ts` - API routes
- `apps/frontend/src/app/n8n-workflows/page.tsx` - Workflow browser
- `database/workflows.db` - SQLite database

## 🛠️ Development Commands

```bash
# Backend only
cd apps/backend
pnpm dev

# Frontend only
cd apps/frontend
pnpm dev

# Both together
pnpm dev

# Reindex workflows
cd apps/backend
pnpm run index-workflows

# Build for production
pnpm build
```

## 🐛 Common Issues

**Q: Port 8000 or 3000 already in use?**
```bash
# Change PORT in apps/backend/.env
# Next.js will auto-assign next available port
```

**Q: No workflows showing?**
```bash
# Reindex the database
cd apps/backend
pnpm run index-workflows
```

**Q: Database errors?**
```bash
# Delete and recreate
rm database/workflows.db
cd apps/backend
pnpm run index-workflows
```

## 📊 Features

✅ **2,057+ Workflows** - Pre-indexed and ready to search
✅ **Full-Text Search** - Sub-millisecond search with SQLite FTS5
✅ **Advanced Filtering** - By trigger, complexity, status
✅ **REST API** - Express backend with TypeScript
✅ **Modern UI** - Next.js 14 with Tailwind CSS
✅ **Type Safety** - Full TypeScript support
✅ **Fast** - Optimized SQLite queries
✅ **Scalable** - Monorepo with Turbo
✅ **Easy Deploy** - Docker support included

## 🎨 Tech Stack

- **Backend:** Node.js + Express + TypeScript + SQLite
- **Frontend:** Next.js 14 + React 18 + Tailwind CSS
- **Database:** SQLite with FTS5 (Full-Text Search)
- **Build:** Turbo + pnpm

## 📚 Learn More

- Full documentation: [README-NODEJS-MIGRATION.md](./README-NODEJS-MIGRATION.md)
- Original README: [README.md](./README.md)

## 🎉 You're Ready!

Start building amazing workflow automation tools! 🚀

