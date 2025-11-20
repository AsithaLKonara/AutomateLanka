# Deployment Runbook

## Overview

This runbook provides step-by-step instructions for deploying AutomateLanka to production.

## Prerequisites

- Railway account (for backend, database, Redis)
- Vercel account (for frontend)
- SendGrid/Postmark account (for emails)
- Sentry account (for error tracking)
- Stripe account (for billing)
- GitHub repository connected to deployment platforms

## Phase 1: Database Setup

### 1.1 Provision PostgreSQL on Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
4. Wait for provisioning (2-3 minutes)
5. Click on PostgreSQL service
6. Go to **"Variables"** tab
7. Copy the `DATABASE_URL` value

### 1.2 Run Migrations

```bash
cd apps/backend

# Set DATABASE_URL in environment
export DATABASE_URL="postgresql://..."

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed plans
npm run db:seed
```

**Verification:**
- Check that 13 tables are created (including audit_logs)
- Verify 3 plans are seeded (Free, Pro, Business)

## Phase 2: Redis Setup

### 2.1 Provision Redis on Railway

1. In Railway project, click **"+ New"** → **"Database"** → **"Redis"**
2. Wait for provisioning
3. Copy `REDIS_URL` from Variables tab

### 2.2 Test Redis Connection

```bash
# Test connection
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

## Phase 3: Backend Deployment

### 3.1 Deploy API Service

1. In Railway, click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Set root directory: `apps/backend`
4. Configure environment variables:

```bash
DATABASE_URL=<from-postgres-service>
REDIS_URL=<from-redis-service>
JWT_SECRET=<generate-32-char-hex>
REFRESH_SECRET=<generate-32-char-hex>
ENCRYPTION_KEY=<32-character-string>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-api-key>
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
PORT=8000
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production
LOG_LEVEL=info
LOG_FORMAT=json
```

5. Set build command: `npm install && npm run build`
6. Set start command: `npm start`
7. Deploy

### 3.2 Deploy Worker Service

1. In Railway, click **"+ New"** → **"GitHub Repo"**
2. Select same repository
3. Set root directory: `apps/backend`
4. Use same environment variables as API
5. Set start command: `npx tsx src/services/workflowWorker.ts`
6. Deploy

**Verification:**
- Check health endpoint: `https://your-backend.railway.app/health`
- Verify worker is processing jobs (check logs)

## Phase 4: Frontend Deployment

### 4.1 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set root directory: `apps/frontend`
4. Configure environment variables:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

5. Deploy

**Verification:**
- Visit deployed URL
- Test authentication flow
- Verify API connection

## Phase 5: Post-Deployment Configuration

### 5.1 Configure Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-backend.railway.app/api/saas-billing/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 5.2 Configure Sentry

1. Create project in Sentry
2. Copy DSN to environment variables
3. Verify errors are being tracked

### 5.3 Set Up Monitoring

1. Configure UptimeRobot/Pingdom to monitor:
   - Backend health: `https://your-backend.railway.app/health`
   - Frontend: `https://yourdomain.com`
2. Set up alerts for downtime

## Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to database

**Solutions**:
- Verify `DATABASE_URL` is correct
- Check Railway PostgreSQL service is running
- Verify network access (Railway should auto-allow)

### Redis Connection Issues

**Problem**: Worker cannot connect to Redis

**Solutions**:
- Verify `REDIS_URL` is correct
- Check Redis service is running
- Test connection: `redis-cli -u $REDIS_URL ping`

### Frontend Cannot Connect to Backend

**Problem**: CORS errors or connection refused

**Solutions**:
- Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- Check backend CORS settings allow frontend domain
- Verify backend is running and accessible

### Worker Not Processing Jobs

**Problem**: Jobs stuck in queue

**Solutions**:
- Check worker service is running
- Verify Redis connection
- Check worker logs for errors
- Verify queue name matches in code

### Email Not Sending

**Problem**: Verification/reset emails not received

**Solutions**:
- Verify SMTP credentials are correct
- Check SendGrid/Postmark account status
- Verify `SMTP_FROM` domain is verified
- Check spam folder
- Review email service logs

## Rollback Procedures

### Rollback Backend

1. In Railway, go to service → Deployments
2. Select previous successful deployment
3. Click "Redeploy"

### Rollback Frontend

1. In Vercel, go to Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

### Database Rollback

```bash
# Rollback last migration
cd apps/backend
npx prisma migrate resolve --rolled-back <migration-name>
```

**Warning**: Only rollback if no data loss is acceptable

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `REDIS_URL` | Redis connection string | `redis://...` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `hex-string` |
| `REFRESH_SECRET` | Refresh token secret (32+ chars) | `hex-string` |
| `ENCRYPTION_KEY` | AES encryption key (32 chars) | `32-char-string` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `FRONTEND_URL` | Frontend URL | `https://yourdomain.com` |
| `NODE_ENV` | Environment | `production` |

### Backend Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server host | - |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASSWORD` | SMTP password | - |
| `SMTP_FROM` | From email address | - |
| `SENTRY_DSN` | Sentry DSN | - |
| `LOG_LEVEL` | Log level | `info` |
| `LOG_FORMAT` | Log format | `json` |
| `PORT` | Server port | `8000` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | `https://backend.railway.app` |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key | `pk_live_...` |

### Frontend Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | - |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Sentry environment | `production` |

## Health Checks

### Backend Health Check

```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "version": "1.0.0"
}
```

### Database Health

```bash
# In Railway PostgreSQL service
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Redis Health

```bash
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

## Monitoring Checklist

- [ ] Backend health endpoint responding
- [ ] Frontend accessible
- [ ] Database connection working
- [ ] Redis connection working
- [ ] Worker processing jobs
- [ ] Sentry receiving errors
- [ ] Emails sending successfully
- [ ] Stripe webhooks receiving events
- [ ] Authentication flow working
- [ ] Workflow execution working

## Support Contacts

- **Railway Support**: [railway.app/support](https://railway.app/support)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Stripe Support**: [stripe.com/support](https://stripe.com/support)

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0

