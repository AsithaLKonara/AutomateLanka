# 🗄️ Database Migration Setup Guide

## Overview

The Prisma schema is configured for **PostgreSQL** (production-ready). To run migrations and seed the database, you need to set up a PostgreSQL connection.

---

## Option 1: Local PostgreSQL (Recommended for Development)

### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### Step 2: Create Database

```bash
createdb autolanka_saas
```

### Step 3: Create `.env` File

Create `apps/backend/.env`:

```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://localhost:5432/autolanka_saas?schema=public"

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="your-generated-secret-here"
REFRESH_SECRET="your-generated-refresh-secret-here"

# Encryption Key (must be exactly 32 characters)
ENCRYPTION_KEY="12345678901234567890123456789012"

# Server Config
PORT=8000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Redis (optional for now)
REDIS_URL="redis://localhost:6379"
```

### Step 4: Run Migrations & Seed

```bash
cd apps/backend

# Generate Prisma Client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Seed plans (Free, Pro, Business)
npm run db:seed
```

Or run all at once:
```bash
npm run db:setup
```

---

## Option 2: Railway PostgreSQL (Cloud - No Local Setup)

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign up / Log in
3. Create a new project

### Step 2: Add PostgreSQL Service

1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Wait for it to provision
3. Click on the PostgreSQL service
4. Go to **"Variables"** tab
5. Copy the `DATABASE_URL` value

### Step 3: Create `.env` File

Create `apps/backend/.env`:

```env
# Paste the DATABASE_URL from Railway
DATABASE_URL="postgresql://user:pass@hostname:port/railway?schema=public"

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="your-generated-secret-here"
REFRESH_SECRET="your-generated-refresh-secret-here"

# Encryption Key (must be exactly 32 characters)
ENCRYPTION_KEY="12345678901234567890123456789012"

# Server Config
PORT=8000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Step 4: Run Migrations & Seed

```bash
cd apps/backend

# Generate Prisma Client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Seed plans (Free, Pro, Business)
npm run db:seed
```

---

## Option 3: Docker PostgreSQL (Alternative)

### Step 1: Create `docker-compose.db.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: autolanka_postgres
    environment:
      POSTGRES_USER: autolanka
      POSTGRES_PASSWORD: password
      POSTGRES_DB: autolanka_saas
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Step 2: Start PostgreSQL

```bash
docker-compose -f docker-compose.db.yml up -d
```

### Step 3: Create `.env` File

```env
DATABASE_URL="postgresql://autolanka:password@localhost:5432/autolanka_saas?schema=public"
# ... rest of env vars
```

### Step 4: Run Migrations

```bash
cd apps/backend
npm run db:setup
```

---

## Verification

After running migrations:

1. **Check migrations applied:**
   ```bash
   npx prisma migrate status
   ```

2. **View database in Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   Opens at `http://localhost:5555`

3. **Verify plans seeded:**
   ```bash
   npx prisma studio
   ```
   Navigate to `Plan` table - should see Free, Pro, Business

---

## What Gets Created

### Database Tables (12 total):
- ✅ `users` - User accounts
- ✅ `refresh_tokens` - JWT refresh tokens
- ✅ `workspaces` - Workspace/tenant containers
- ✅ `memberships` - User-workspace relationships
- ✅ `workflows` - N8N workflow definitions
- ✅ `workflow_versions` - Workflow version history
- ✅ `runs` - Workflow execution records
- ✅ `integrations` - OAuth integrations
- ✅ `plans` - Billing plans (Free/Pro/Business)
- ✅ `subscriptions` - Workspace subscriptions
- ✅ `usage_records` - Usage tracking
- ✅ `api_keys` - API authentication keys

### Seeded Data:
- ✅ **Free Plan**: 100 runs/month, 5 workflows, 1 member
- ✅ **Pro Plan**: $29/month, 10K runs, 100 workflows, 10 members
- ✅ **Business Plan**: $99/month, 100K runs, unlimited workflows/members

---

## Troubleshooting

### Error: "Can't reach database server"
- **PostgreSQL not running**: Start PostgreSQL service
- **Wrong connection string**: Check DATABASE_URL format
- **Port in use**: Change port or stop other PostgreSQL instance

### Error: "Database does not exist"
- Create database: `createdb autolanka_saas`
- Or use Railway which creates it automatically

### Error: "Migration failed"
- Reset database:
  ```bash
  npx prisma migrate reset
  npm run db:setup
  ```

### Error: "Environment variable not found"
- Make sure `.env` file exists in `apps/backend/`
- Check file name is exactly `.env` (not `.env.example`)

---

## Next Steps

Once migrations are complete:

1. ✅ Database schema created
2. ✅ Plans seeded (Free/Pro/Business)
3. ✅ Ready for authentication tests
4. ✅ Ready for workflow import
5. ✅ Ready for deployment

**Continue with:** Testing authentication flow, deploying to production, etc.

---

## Production Notes

For production deployment:
- Use Railway PostgreSQL (recommended)
- Or AWS RDS, Supabase, or other managed PostgreSQL
- Set `DATABASE_URL` as environment variable (don't commit to git)
- Run migrations during deployment:
  ```bash
  npx prisma migrate deploy
  ```

