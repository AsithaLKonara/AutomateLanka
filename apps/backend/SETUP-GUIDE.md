# Backend Setup Guide - Full SaaS Platform

## Phase 1: Database & Authentication Setup

### Step 1: Environment Variables

Create a `.env` file in `apps/backend/` directory:

```bash
cd apps/backend
cp ENV-SETUP.md .env
# Edit .env with your values
```

**Minimum required for local development:**

```env
# Use SQLite for easiest local setup
DATABASE_URL="file:./dev.db"

# Generate JWT secrets (run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="your-generated-secret-here"
REFRESH_SECRET="your-generated-secret-here"
ENCRYPTION_KEY="12345678901234567890123456789012"

# Server config
PORT=8000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Step 2: Switch to SQLite for Local Development (Optional)

If you want to use SQLite instead of PostgreSQL for local development:

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  // provider = "postgresql"  // Comment this
  // url      = env("DATABASE_URL")  // Comment this
  provider = "sqlite"  // Uncomment this
  url      = "file:./dev.db"  // Uncomment this
}
```

**Note:** Some features differ between SQLite and PostgreSQL:
- SQLite: Simpler, no server needed, good for development
- PostgreSQL: Production-ready, better performance, required for deployment

### Step 3: Generate Prisma Client

```bash
cd apps/backend
npm run db:generate
```

This generates the TypeScript Prisma Client based on your schema.

### Step 4: Create Initial Migration

```bash
npm run db:migrate
```

This will:
1. Create migration files
2. Apply migrations to database
3. Automatically run seed script (creates Free/Pro/Business plans)

Or run step-by-step:
```bash
npx prisma migrate dev --name init
npm run db:seed
```

### Step 5: Verify Setup

```bash
# Check that Prisma client was generated
ls node_modules/.prisma/client

# Check database (if using SQLite)
ls -la dev.db

# View database in Prisma Studio
npx prisma studio
```

Prisma Studio will open at `http://localhost:5555` where you can browse tables.

---

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"
- Make sure `.env` file exists in `apps/backend/`
- Check that DATABASE_URL is set

### Error: "Can't reach database server"
- If using PostgreSQL: Make sure PostgreSQL is running
- If using SQLite: Make sure file path is correct

### Error: Migration failed
- Delete `prisma/migrations` folder
- Delete database file (if SQLite: `rm dev.db`)
- Run `npm run db:migrate` again

### Start fresh:
```bash
# Delete everything and start over
rm -rf prisma/migrations
rm -f dev.db dev.db-journal
npm run db:setup
```

---

## Using PostgreSQL (Production)

### Local PostgreSQL:

1. Install PostgreSQL:
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt install postgresql
sudo systemctl start postgresql
```

2. Create database:
```bash
createdb autolanka_saas
```

3. Update `.env`:
```env
DATABASE_URL="postgresql://localhost:5432/autolanka_saas?schema=public"
```

4. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

5. Run migrations:
```bash
npm run db:setup
```

### Railway PostgreSQL (Recommended for Deployment):

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy `DATABASE_URL` from Railway dashboard
5. Add to `.env`:
```env
DATABASE_URL="postgresql://user:pass@host:port/dbname"
```
6. Run migrations:
```bash
npm run db:setup
```

---

## Next Steps

After database is set up, you can:

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Check Phase 1 is complete:**
   - ✅ Prisma schema created (9 tables)
   - ✅ Database migrations run
   - ✅ Plans seeded (Free, Pro, Business)
   - ✅ Dependencies installed (bcryptjs, jsonwebtoken, nodemailer)

3. **Move to Phase 2: Authentication Service**
   - Build JWT auth service
   - Create auth routes
   - Implement registration/login

4. **View your tables in Prisma Studio:**
   ```bash
   npx prisma studio
   ```

---

## Database Schema Overview

Your database now has these tables:

1. **users** - User accounts
2. **refresh_tokens** - JWT refresh tokens
3. **workspaces** - Multi-tenant workspaces
4. **memberships** - User-workspace relationships
5. **workflows** - Workflow definitions (JSON)
6. **workflow_versions** - Version history
7. **runs** - Execution history
8. **integrations** - OAuth connections
9. **plans** - Subscription plans (seeded)
10. **subscriptions** - Active subscriptions
11. **usage_records** - Usage tracking for billing
12. **api_keys** - API authentication keys

---

## Status: Phase 1 Complete! ✅

You've successfully:
- ✅ Installed Prisma and dependencies
- ✅ Created comprehensive database schema
- ✅ Set up seed data for plans
- ✅ Ready for migrations

**Next:** Run the migration command and move to Phase 2 (Authentication).

