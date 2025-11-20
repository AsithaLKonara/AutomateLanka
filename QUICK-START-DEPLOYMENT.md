# Quick Start Deployment Guide

## Prerequisites Checklist

Before starting deployment, ensure you have:

- [ ] Railway account (free tier available)
- [ ] Vercel account (free tier available)
- [ ] GitHub repository pushed
- [ ] Stripe account (for billing)
- [ ] SendGrid/Postmark account (for emails, optional)
- [ ] Sentry account (for error tracking, optional)

## Step 1: Install Dependencies (5 minutes)

```bash
# Backend
cd apps/backend
npm install

# Frontend
cd ../frontend
npm install
```

✅ **Dependencies installed**: Sentry packages added to both apps

## Step 2: Database Setup (15 minutes)

### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 2.2 Add PostgreSQL

1. In Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for provisioning (~2 minutes)
4. Click on PostgreSQL service
5. Go to **"Variables"** tab
6. Copy the `DATABASE_URL` value

### 2.3 Run Migrations

```bash
cd apps/backend

# Set DATABASE_URL (or use Railway CLI)
export DATABASE_URL="postgresql://..."

# Generate Prisma Client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Seed plans
npm run db:seed
```

**Verify:**
```bash
# Check tables (in Railway PostgreSQL service)
psql $DATABASE_URL -c "\dt"
# Should show 13 tables including audit_logs
```

## Step 3: Redis Setup (10 minutes)

### 3.1 Add Redis to Railway

1. In Railway project, click **"+ New"**
2. Select **"Database"** → **"Redis"**
3. Wait for provisioning
4. Copy `REDIS_URL` from Variables tab

### 3.2 Test Connection

```bash
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

## Step 4: Backend Deployment (30 minutes)

### 4.1 Deploy API Service

1. In Railway, click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Configure:
   - **Root Directory**: `apps/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. Add Environment Variables:
   ```
   DATABASE_URL=<from-postgres-service>
   REDIS_URL=<from-redis-service>
   JWT_SECRET=<generate-32-char-hex>
   REFRESH_SECRET=<generate-32-char-hex>
   ENCRYPTION_KEY=<32-character-string>
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FRONTEND_URL=https://yourdomain.com
   NODE_ENV=production
   PORT=8000
   SENTRY_DSN=https://... (optional)
   SMTP_HOST=smtp.sendgrid.net (optional)
   SMTP_PORT=587 (optional)
   SMTP_USER=apikey (optional)
   SMTP_PASSWORD=<api-key> (optional)
   SMTP_FROM=noreply@yourdomain.com (optional)
   ```

5. Click **"Deploy"**

### 4.2 Deploy Worker Service

1. In Railway, click **"+ New"** → **"GitHub Repo"**
2. Select same repository
3. Configure:
   - **Root Directory**: `apps/backend`
   - **Start Command**: `npx tsx src/services/workflowWorker.ts`
   - **Same environment variables** as API service

4. Click **"Deploy"**

### 4.3 Verify Backend

```bash
# Health check
curl https://your-backend.railway.app/health

# Expected: {"status":"healthy",...}
```

## Step 5: Frontend Deployment (20 minutes)

### 5.1 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
   NEXT_PUBLIC_STRIPE_KEY=pk_live_...
   NEXT_PUBLIC_SENTRY_DSN=https://... (optional)
   ```

6. Click **"Deploy"**

### 5.2 Verify Frontend

- Visit deployed URL
- Test login/register
- Verify API connection

## Step 6: Post-Deployment Configuration (30 minutes)

### 6.1 Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-backend.railway.app/api/saas-billing/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret → Add to `STRIPE_WEBHOOK_SECRET`

### 6.2 Sentry Setup (Optional)

1. Create project at [sentry.io](https://sentry.io)
2. Copy DSN
3. Add to environment variables:
   - Backend: `SENTRY_DSN`
   - Frontend: `NEXT_PUBLIC_SENTRY_DSN`

### 6.3 SMTP Setup (Optional)

1. Create SendGrid/Postmark account
2. Get API key
3. Add to backend environment variables
4. Test email sending

## Step 7: Validation (30 minutes)

Follow `PRODUCTION-VALIDATION.md` checklist:

- [ ] Health checks passing
- [ ] Authentication working
- [ ] Workflow execution working
- [ ] Billing integration working
- [ ] Monitoring operational

## Troubleshooting

### Backend Won't Start

- Check environment variables are set
- Check logs in Railway
- Verify DATABASE_URL format
- Verify Redis connection

### Frontend Can't Connect

- Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- Check CORS settings
- Verify backend is running

### Migration Fails

```bash
# Check status
npx prisma migrate status

# Reset if needed (WARNING: deletes data)
npx prisma migrate reset
npm run db:setup
```

### Worker Not Processing

- Check Redis connection
- Verify worker service is running
- Check worker logs
- Verify queue name matches

## Quick Commands Reference

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# Test Redis
redis-cli -u $REDIS_URL ping

# Check backend health
curl https://your-backend.railway.app/health

# View logs (Railway)
railway logs

# View logs (Vercel)
vercel logs
```

## Estimated Time

- **Infrastructure Setup**: 30 minutes
- **Backend Deployment**: 30 minutes
- **Frontend Deployment**: 20 minutes
- **Configuration**: 30 minutes
- **Validation**: 30 minutes

**Total**: ~2.5 hours

## Success Criteria

✅ Backend health check returns 200  
✅ Frontend loads and connects to backend  
✅ User can register and login  
✅ Workflow can be executed  
✅ Billing subscription works  
✅ Monitoring shows no critical errors  

---

**Need help?** See `DEPLOYMENT-RUNBOOK.md` for detailed troubleshooting.

