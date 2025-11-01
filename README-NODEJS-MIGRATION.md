# 🚀 AutomateLanka - Node.js + Next.js Migration

## Overview

This project has been migrated from Python (FastAPI) to a modern **Node.js + Next.js** full-stack application.

## 🏗️ Architecture

### Tech Stack

**Backend:**
- **Node.js** + **TypeScript**
- **Express.js** - RESTful API server
- **better-sqlite3** - Fast SQLite database with FTS5 full-text search
- **Zod** - Schema validation

**Frontend:**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

**Build & Dev Tools:**
- **Turbo** - Monorepo build system
- **pnpm** - Fast package manager
- **tsx** - TypeScript execution

## 📁 Project Structure

```
apps/
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── routes/
│   │   │   └── workflows.ts  # Workflow API endpoints
│   │   ├── services/
│   │   │   └── workflowDatabase.ts  # SQLite database service
│   │   ├── scripts/
│   │   │   └── indexWorkflows.ts    # Workflow indexer
│   │   └── server.ts         # Express server
│   └── package.json
│
└── frontend/                 # Next.js 14 App
    ├── src/
    │   ├── app/
    │   │   ├── api/
    │   │   │   └── workflows/  # Next.js API routes
    │   │   ├── n8n-workflows/  # Workflow browser page
    │   │   ├── page.tsx        # Home page
    │   │   └── layout.tsx
    │   └── components/
    └── package.json

packages/
├── ui/                       # Shared UI components
├── common/                   # Shared utilities
└── db/                       # Shared database types

database/
└── workflows.db              # SQLite database

workflows/                    # 2,057+ N8N workflow JSON files
└── [category]/
    └── *.json
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **pnpm 8+** (or npm/yarn)

### Installation

1. **Run setup script:**

```bash
chmod +x setup-node.sh
./setup-node.sh
```

This will:
- Check Node.js and pnpm installation
- Install all dependencies
- Create .env files
- Set up database directories

2. **Index workflows:**

```bash
cd apps/backend
pnpm run index-workflows
```

This will scan all workflows and index them into SQLite.

3. **Start development servers:**

**Option A: Run both together (recommended)**
```bash
# From project root
pnpm dev
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Frontend
cd apps/frontend
pnpm dev
```

4. **Access the application:**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Workflow Browser:** http://localhost:3000/n8n-workflows
- **API Documentation:** http://localhost:8000/api/workflows

## 📊 API Endpoints

### Backend (Express)

```bash
# Search workflows
GET /api/workflows?q=slack&trigger=webhook&complexity=high&page=1&per_page=20

# Get workflow stats
GET /api/workflows/stats

# Get workflow details
GET /api/workflows/:filename

# Download workflow
GET /api/workflows/:filename/download

# Reindex workflows
POST /api/workflows/reindex
```

### Frontend (Next.js API Routes)

```bash
# Proxy to backend with caching
GET /api/workflows?q=...
GET /api/workflows/stats
GET /api/workflows/:filename
```

## 🎨 Frontend Pages

### Home Page
`/` - Landing page with system status

### N8N Workflows Browser
`/n8n-workflows` - Browse and download workflows with:
- Full-text search
- Filter by trigger type (Webhook, Scheduled, Manual, Complex)
- Filter by complexity (Low, Medium, High)
- Active/Inactive toggle
- Pagination
- Download functionality

### Other Pages
- `/dashboard` - Main dashboard
- `/workflows` - Workflow management (different from N8N browser)
- `/analytics` - Analytics dashboard
- `/marketplace` - Marketplace
- `/settings` - Settings

## 🔧 Configuration

### Environment Variables

**Root `.env`:**
```env
DATABASE_URL="file:./database/workflows.db"
WORKFLOW_DB_PATH="database/workflows.db"
PORT=8000
HOST=0.0.0.0
NODE_ENV=development
```

**Backend `.env`:**
```env
PORT=8000
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL="file:../../database/workflows.db"
WORKFLOW_DB_PATH="../../database/workflows.db"
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000
```

## 📦 Key Dependencies

### Backend
- `express` - Web framework
- `better-sqlite3` - SQLite database
- `tsx` - TypeScript execution
- `zod` - Schema validation
- `cors` - CORS middleware
- `helmet` - Security middleware

### Frontend
- `next@14` - React framework
- `react@18` - UI library
- `tailwindcss` - CSS framework
- `@radix-ui/*` - Accessible components
- `lucide-react` - Icons

## 🗄️ Database

### SQLite with FTS5

The database uses SQLite with FTS5 (Full-Text Search) for:
- Sub-millisecond search performance
- Complex filtering
- Pagination
- 2,057+ indexed workflows

### Schema

```sql
-- Main table
CREATE TABLE workflows (
  id INTEGER PRIMARY KEY,
  filename TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN,
  description TEXT,
  trigger_type TEXT,
  complexity TEXT,
  node_count INTEGER,
  integrations TEXT,  -- JSON array
  tags TEXT,          -- JSON array
  ...
);

-- FTS5 search index
CREATE VIRTUAL TABLE workflows_fts USING fts5(
  filename, name, description, integrations, tags,
  content=workflows
);
```

## 🚀 Production Deployment

### Build

```bash
# Build all packages
pnpm build

# Build backend only
cd apps/backend && pnpm build

# Build frontend only
cd apps/frontend && pnpm build
```

### Run Production

```bash
# Backend
cd apps/backend
pnpm start

# Frontend
cd apps/frontend
pnpm start
```

### Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.prod.yml up
```

## 📈 Performance

- **Search**: Sub-millisecond response times with FTS5
- **Indexing**: 2,057 workflows in ~5 seconds
- **API**: Express middleware pipeline optimized
- **Frontend**: Next.js 14 App Router with caching
- **Database**: SQLite WAL mode for concurrent reads

## 🔄 Migration from Python

### What Changed

| Component | Before (Python) | After (Node.js) |
|-----------|----------------|-----------------|
| Backend | FastAPI | Express + TypeScript |
| Database | SQLite3 (Python) | better-sqlite3 (Node.js) |
| Server | Uvicorn | Node.js HTTP |
| Frontend | Static HTML/JS | Next.js 14 |
| API | Python types | TypeScript + Zod |
| Dev Server | `python run.py` | `pnpm dev` |

### What Stayed the Same

- SQLite database structure (compatible)
- Workflow JSON files (unchanged)
- API endpoints (same paths)
- Search functionality (FTS5)
- Features and capabilities

## 🛠️ Development

### Scripts

```bash
# Backend
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm index-workflows  # Reindex workflows
pnpm test             # Run tests
pnpm lint             # Lint code

# Frontend
pnpm dev              # Start Next.js dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Lint code

# Root (Turbo)
pnpm dev              # Start all dev servers
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm clean            # Clean all build artifacts
```

### Adding New Features

1. **Backend API Route:**
   - Add route in `apps/backend/src/routes/`
   - Register in `apps/backend/src/server.ts`

2. **Frontend Page:**
   - Add page in `apps/frontend/src/app/[route]/page.tsx`
   - Use App Router conventions

3. **Shared Component:**
   - Add to `packages/ui/src/components/`
   - Export from `packages/ui/src/index.ts`

## 🐛 Troubleshooting

### Database not found
```bash
cd apps/backend
pnpm run index-workflows
```

### Port already in use
```bash
# Change ports in .env files
PORT=8001  # Backend
# Frontend will auto-assign next available port
```

### pnpm not found
```bash
npm install -g pnpm
```

### Build errors
```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules
pnpm install
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)

## 🙋 Support

For issues or questions:
1. Check this README
2. Check the [main README](./README.md)
3. Review the code comments
4. Open an issue on GitHub

## 🎉 Next Steps

1. ✅ Backend migrated to Node.js + Express
2. ✅ Frontend upgraded to Next.js 14
3. ✅ Database service using better-sqlite3
4. ✅ API routes and workflow browser page
5. 🔄 Add authentication with Clerk
6. 🔄 Add more dashboard features
7. 🔄 Implement workflow execution
8. 🔄 Add analytics and monitoring

---

**Built with ❤️ using Node.js + Next.js + TypeScript**

