# Next Steps - Quick Start Guide

## Immediate Actions Required

### 1. Install Dependencies

```bash
# Backend dependencies
cd apps/backend
npm install

# Frontend dependencies  
cd ../frontend
npm install
```

**New dependencies added:**
- Backend: `@sentry/node`, `@sentry/profiling-node`
- Frontend: `@sentry/nextjs`

### 2. Create Database Migration

The schema has been updated with the `AuditLog` table. Create and apply the migration:

```bash
cd apps/backend

# Generate migration
npm run db:migrate

# This will:
# 1. Create migration file for audit_logs table
# 2. Apply migration to database
# 3. Generate Prisma Client
```

**Migration name**: `add_audit_logs_table`

**What it creates:**
- `audit_logs` table with indexes
- Relations to `users` and `workspaces` tables

### 3. Verify Prisma Client Generation

```bash
cd apps/backend
npm run db:generate
```

This ensures the Prisma Client includes the new `AuditLog` model.

### 4. Test Locally (Optional)

Before deploying, test the new features locally:

```bash
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Worker (if testing workflow execution)
cd apps/backend
npx tsx src/services/workflowWorker.ts

# Terminal 3: Frontend
cd apps/frontend
npm run dev
```

**Test checklist:**
- [ ] Backend starts without errors
- [ ] Health endpoint works: `http://localhost:8000/health`
- [ ] Auth endpoints work
- [ ] Audit logs are created on login/register
- [ ] Frontend connects to backend

## Deployment Preparation

### Environment Variables Checklist

Before deploying, ensure you have all required environment variables:

#### Backend (.env or Railway Variables)

**Required:**
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `REDIS_URL` - Redis connection string
- [ ] `JWT_SECRET` - 32+ character hex string
- [ ] `REFRESH_SECRET` - 32+ character hex string
- [ ] `ENCRYPTION_KEY` - Exactly 32 characters
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `FRONTEND_URL` - Your frontend URL
- [ ] `NODE_ENV=production`

**Optional (but recommended):**
- [ ] `SENTRY_DSN` - Sentry error tracking
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` - Email service
- [ ] `LOG_LEVEL=info`
- [ ] `LOG_FORMAT=json`

#### Frontend (Vercel Environment Variables)

**Required:**
- [ ] `NEXT_PUBLIC_BACKEND_URL` - Backend API URL
- [ ] `NEXT_PUBLIC_STRIPE_KEY` - Stripe publishable key

**Optional:**
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking
- [ ] `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`

### Generate Secrets

If you need to generate JWT secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ENCRYPTION_KEY (32 characters, any string)
# Example: "12345678901234567890123456789012"
```

## Deployment Steps

Follow the detailed guide in `DEPLOYMENT-RUNBOOK.md`. Quick summary:

### Phase 1: Infrastructure (2-3 hours)

1. **PostgreSQL on Railway**
   - Create new project
   - Add PostgreSQL service
   - Copy `DATABASE_URL`
   - Run migrations: `npm run db:setup`

2. **Redis on Railway**
   - Add Redis service
   - Copy `REDIS_URL`

### Phase 2: Backend Deployment (3-4 hours)

1. **Deploy API Service**
   - Connect GitHub repo to Railway
   - Set root: `apps/backend`
   - Configure all environment variables
   - Deploy

2. **Deploy Worker Service**
   - Add new service in Railway
   - Same repo, same root
   - Start command: `npx tsx src/services/workflowWorker.ts`
   - Same environment variables
   - Deploy

### Phase 3: Frontend Deployment (2 hours)

1. **Deploy to Vercel**
   - Import GitHub repo
   - Set root: `apps/frontend`
   - Configure environment variables
   - Deploy

### Phase 4: Post-Deployment (1-2 hours)

1. **Configure Stripe Webhooks**
   - Add webhook endpoint
   - Copy webhook secret

2. **Configure Sentry**
   - Create projects
   - Copy DSNs

3. **Test Everything**
   - Follow `PRODUCTION-VALIDATION.md`

## Quick Verification Commands

After deployment, verify everything works:

```bash
# Backend health
curl https://your-backend.railway.app/health

# Frontend
curl https://yourdomain.com

# Database (in Railway PostgreSQL service)
psql $DATABASE_URL -c "SELECT COUNT(*) FROM audit_logs;"

# Redis
redis-cli -u $REDIS_URL ping
```

## Troubleshooting

### Migration Fails

If migration fails:
```bash
# Check migration status
npx prisma migrate status

# Reset if needed (WARNING: deletes data)
npx prisma migrate reset
npm run db:setup
```

### Sentry Not Working

- Verify DSN is correct
- Check environment variable is set
- Verify Sentry project is active
- Check browser console for errors

### Worker Not Processing Jobs

- Verify Redis connection
- Check worker logs in Railway
- Verify queue name matches
- Check worker service is running

## Support Resources

- **Deployment Guide**: `DEPLOYMENT-RUNBOOK.md`
- **API Documentation**: `API-DOCUMENTATION.md`
- **Validation Guide**: `PRODUCTION-VALIDATION.md`
- **Implementation Summary**: `IMPLEMENTATION-COMPLETE.md`

## What's Been Implemented

✅ Database schema with audit logging  
✅ Security enhancements (CSP, HSTS, audit logs)  
✅ Winston structured logging  
✅ Sentry error tracking (backend + frontend)  
✅ Redis caching service  
✅ Database performance indexes  
✅ Unit and integration tests  
✅ E2E test framework  
✅ Complete API documentation  
✅ Deployment runbook  
✅ Production validation guide  

## Estimated Time to Production

- **Infrastructure Setup**: 2-3 hours
- **Backend Deployment**: 3-4 hours
- **Frontend Deployment**: 2 hours
- **Configuration & Testing**: 2-3 hours

**Total**: 9-12 hours

---

**Ready to deploy!** Follow `DEPLOYMENT-RUNBOOK.md` for detailed instructions.

