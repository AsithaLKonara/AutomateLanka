# 🚀 Production Action Checklist

## Quick Reference: What to Do Next

### 🔴 CRITICAL - Must Do First (8-10 hours)

#### 1. Database Setup (2-3 hours)
```bash
# Option A: Railway (Easiest)
1. Go to railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy DATABASE_URL
5. Add to apps/backend/.env

# Option B: Local PostgreSQL
brew install postgresql
brew services start postgresql
createdb autolanka_saas

# Then run migrations
cd apps/backend
npm run db:setup
```

**Checklist:**
- [ ] PostgreSQL provisioned
- [ ] DATABASE_URL configured
- [ ] Migrations run successfully
- [ ] Plans seeded (Free, Pro, Business)
- [ ] Database connection tested

---

#### 2. Redis Setup (1 hour)
```bash
# Option A: Railway
1. Add Redis service in Railway
2. Copy REDIS_URL
3. Add to apps/backend/.env

# Option B: Upstash (Free tier available)
1. Go to upstash.com
2. Create Redis database
3. Copy REDIS_URL
4. Add to apps/backend/.env

# Test connection
redis-cli -u $REDIS_URL ping
```

**Checklist:**
- [ ] Redis instance provisioned
- [ ] REDIS_URL configured
- [ ] Connection tested
- [ ] Worker can connect to queue

---

#### 3. Backend Deployment (3-4 hours)
```bash
# Railway Deployment
1. Connect GitHub repo to Railway
2. Add backend service
3. Configure environment variables:
   - DATABASE_URL
   - REDIS_URL
   - JWT_SECRET (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   - REFRESH_SECRET (generate same way)
   - ENCRYPTION_KEY (32 chars)
   - STRIPE_SECRET_KEY
   - FRONTEND_URL
4. Deploy

# Deploy Worker (separate service)
1. Add new service in Railway
2. Use same codebase
3. Set start command: npx tsx src/services/workflowWorker.ts
4. Configure same env vars
5. Deploy
```

**Checklist:**
- [ ] Backend API deployed
- [ ] Worker process deployed
- [ ] All environment variables set
- [ ] Health check endpoint working
- [ ] API endpoints responding

---

#### 4. Frontend Deployment (2 hours)
```bash
# Vercel Deployment
1. Connect GitHub repo to Vercel
2. Set root directory: apps/frontend
3. Configure environment variables:
   - NEXT_PUBLIC_BACKEND_URL (your Railway backend URL)
   - NEXT_PUBLIC_STRIPE_KEY (Stripe publishable key)
4. Deploy
```

**Checklist:**
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Frontend connects to backend
- [ ] Authentication flow works
- [ ] All pages load correctly

---

#### 5. SMTP Configuration (1-2 hours)
```bash
# Option A: SendGrid (Free tier: 100 emails/day)
1. Sign up at sendgrid.com
2. Create API key
3. Add to apps/backend/.env:
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=<your-api-key>
   SMTP_FROM=noreply@yourdomain.com

# Option B: Postmark (Free tier: 100 emails/month)
# Option C: AWS SES
```

**Checklist:**
- [ ] SMTP provider configured
- [ ] Email sending tested
- [ ] Verification emails work
- [ ] Password reset emails work

---

### 🟡 IMPORTANT - Should Do Next (8-10 hours)

#### 6. Monitoring Setup (3-4 hours)
```bash
# Sentry Error Tracking
1. Create account at sentry.io
2. Create project (Node.js + Next.js)
3. Install packages:
   cd apps/backend && npm install @sentry/node
   cd apps/frontend && npm install @sentry/nextjs
4. Configure DSN in both apps
5. Add error boundaries

# Winston Logging
1. Install winston (already in package.json)
2. Configure log levels
3. Set up log rotation
4. Configure log aggregation (optional)
```

**Checklist:**
- [ ] Sentry configured
- [ ] Error tracking working
- [ ] Winston logging configured
- [ ] Logs being collected
- [ ] Uptime monitoring set up

---

#### 7. Security Hardening (2-3 hours)
```bash
# Audit Logging
1. Create audit_logs table (or add to existing)
2. Log sensitive actions:
   - User login/logout
   - Workspace creation/deletion
   - Workflow execution
   - Billing changes
3. Store in database

# Security Headers
1. Verify Helmet.js is configured
2. Add CSP headers
3. Add HSTS headers
4. Configure rate limiting per workspace
```

**Checklist:**
- [ ] Audit logging implemented
- [ ] Security headers configured
- [ ] Rate limiting per workspace
- [ ] API key rotation mechanism
- [ ] DDoS protection (Cloudflare)

---

#### 8. Performance Optimization (2-3 hours)
```bash
# Redis Caching
1. Implement cache service (structure exists)
2. Cache user sessions
3. Cache workspace data
4. Cache workflow metadata

# Database Optimization
1. Review query performance
2. Add missing indexes
3. Optimize N+1 queries
4. Set up connection pooling
```

**Checklist:**
- [ ] Redis caching implemented
- [ ] Database queries optimized
- [ ] CDN configured (Vercel automatic)
- [ ] Request compression enabled
- [ ] Connection pooling configured

---

#### 9. Testing (Start Critical Paths) (4-6 hours)
```bash
# Unit Tests
1. Test auth service
2. Test workspace service
3. Test workflow executor

# Integration Tests
1. Test auth flow
2. Test workflow execution
3. Test billing flow

# E2E Tests (Playwright)
1. Test user registration
2. Test workflow execution
3. Test billing subscription
```

**Checklist:**
- [ ] Unit tests for critical services
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows
- [ ] CI/CD configured
- [ ] Test coverage >60%

---

### 🟢 NICE TO HAVE - Can Do Later

#### 10. Documentation (2-3 hours)
- [ ] Generate OpenAPI/Swagger docs
- [ ] Create deployment runbook
- [ ] Write troubleshooting guide
- [ ] Document all environment variables

#### 11. Advanced Features
- [ ] Visual workflow editor
- [ ] Scheduled workflows (cron)
- [ ] Workflow templates marketplace
- [ ] Real-time collaboration

---

## 🎯 Priority Order

### Week 1: Get It Live
1. ✅ Database setup
2. ✅ Redis setup
3. ✅ Backend deployment
4. ✅ Frontend deployment
5. ✅ SMTP configuration

**Result**: Platform is live and functional

### Week 2: Make It Production-Ready
1. ✅ Monitoring setup
2. ✅ Security hardening
3. ✅ Performance optimization
4. ✅ Critical path testing

**Result**: Enterprise-grade platform

### Week 3: Polish & Document
1. ✅ Comprehensive testing
2. ✅ Complete documentation
3. ✅ Load testing
4. ✅ Security audit

**Result**: Fully production-ready

---

## 📋 Environment Variables Checklist

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://..."

# JWT
JWT_SECRET="<generate-32-char-hex>"
REFRESH_SECRET="<generate-32-char-hex>"

# Encryption
ENCRYPTION_KEY="<32-char-string>"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# SMTP
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="<api-key>"
SMTP_FROM="noreply@yourdomain.com"

# URLs
FRONTEND_URL="https://yourdomain.com"
NODE_ENV="production"
PORT=8000

# Sentry (optional)
SENTRY_DSN="https://..."
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL="https://your-backend.railway.app"
NEXT_PUBLIC_STRIPE_KEY="pk_live_..."

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

---

## 🚨 Common Issues & Solutions

### Issue: Database connection fails
**Solution**: Check DATABASE_URL format, verify PostgreSQL is running, check firewall rules

### Issue: Redis connection fails
**Solution**: Verify REDIS_URL, check Redis is running, test with redis-cli

### Issue: Worker not processing jobs
**Solution**: Verify worker is deployed separately, check Redis connection, verify queue name matches

### Issue: Emails not sending
**Solution**: Check SMTP credentials, verify SMTP provider allows sending, check spam folder

### Issue: Frontend can't connect to backend
**Solution**: Verify NEXT_PUBLIC_BACKEND_URL, check CORS settings, verify backend is running

---

## ✅ Final Production Checklist

Before going live, verify:

### Infrastructure
- [ ] Database provisioned and migrated
- [ ] Redis provisioned and connected
- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Worker process running
- [ ] Domain configured (optional)
- [ ] SSL certificates active

### Security
- [ ] All secrets in environment variables (not in code)
- [ ] JWT secrets are strong and unique
- [ ] Encryption key is 32 characters
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Audit logging implemented

### Functionality
- [ ] User registration works
- [ ] User login works
- [ ] Workflow import works
- [ ] Workflow execution works
- [ ] Billing subscription works
- [ ] Email sending works
- [ ] OAuth integrations work

### Monitoring
- [ ] Error tracking configured
- [ ] Logging configured
- [ ] Uptime monitoring set up
- [ ] Alerts configured

### Testing
- [ ] Critical paths tested
- [ ] API endpoints tested
- [ ] Frontend flows tested
- [ ] Error handling tested

---

## 🎉 You're Ready!

Once all critical items are checked, your platform is ready for enterprise production! 🚀

**Estimated Total Time**: 15-20 hours of focused work

**Current Status**: 70% → Target: 100% Production Ready

