# Production Validation Guide

## Overview

This guide provides a comprehensive checklist for validating the production deployment of AutomateLanka.

## Pre-Deployment Validation

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] All environment variables documented
- [ ] Security audit completed (npm audit)

### Database

- [ ] Migrations tested on staging
- [ ] Seed data verified
- [ ] Indexes created
- [ ] Backup strategy configured

### Infrastructure

- [ ] All services provisioned
- [ ] Environment variables configured
- [ ] Health checks responding
- [ ] Monitoring configured

## Post-Deployment Validation

### Infrastructure Health

#### Backend API

```bash
# Health check
curl https://your-backend.railway.app/health

# Expected: {"status":"healthy","timestamp":"...","version":"1.0.0"}
```

- [ ] Health endpoint returns 200
- [ ] Response time < 500ms
- [ ] No errors in logs

#### Frontend

```bash
curl https://yourdomain.com

# Expected: HTML response with 200 status
```

- [ ] Frontend loads successfully
- [ ] No console errors
- [ ] All assets loading
- [ ] Response time < 2s

#### Database

```bash
# Test connection (in Railway PostgreSQL service)
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

- [ ] Connection successful
- [ ] All tables exist (13 tables)
- [ ] Plans seeded (3 plans)
- [ ] Queries executing

#### Redis

```bash
redis-cli -u $REDIS_URL ping
# Expected: PONG
```

- [ ] Connection successful
- [ ] Queue accessible
- [ ] Worker can connect

### Authentication Flow

#### Registration

1. Navigate to `/auth/register`
2. Fill form with test email
3. Submit
4. Verify:
   - [ ] User created in database
   - [ ] Workspace created
   - [ ] Tokens returned
   - [ ] Redirected to dashboard
   - [ ] Audit log created

#### Login

1. Navigate to `/auth/login`
2. Enter credentials
3. Submit
4. Verify:
   - [ ] Tokens returned
   - [ ] Redirected to dashboard
   - [ ] Last login updated
   - [ ] Audit log created

#### Token Refresh

1. Wait 15+ minutes (or manually expire token)
2. Make authenticated request
3. Verify:
   - [ ] Refresh endpoint called
   - [ ] New access token returned
   - [ ] Request succeeds

#### Logout

1. Click logout
2. Verify:
   - [ ] Refresh token revoked
   - [ ] Redirected to login
   - [ ] Audit log created

### Workflow Management

#### Create Workflow

1. Navigate to `/w/:id/workflows/new`
2. Upload workflow JSON
3. Save
4. Verify:
   - [ ] Workflow created in database
   - [ ] Metadata extracted
   - [ ] Accessible in list

#### Execute Workflow

1. Navigate to workflow detail
2. Click "Run"
3. Verify:
   - [ ] Run record created
   - [ ] Job queued in Redis
   - [ ] Worker processes job
   - [ ] Status updates in real-time
   - [ ] Logs captured
   - [ ] Output saved
   - [ ] Usage incremented

#### View Run History

1. Navigate to `/w/:id/runs`
2. Verify:
   - [ ] Runs listed
   - [ ] Status displayed
   - [ ] Logs accessible
   - [ ] Pagination works

### Billing Integration

#### View Plans

1. Navigate to `/w/:id/settings/billing`
2. Verify:
   - [ ] Plans displayed
   - [ ] Pricing correct
   - [ ] Features listed

#### Subscribe to Plan

1. Click "Upgrade" on a plan
2. Complete Stripe checkout
3. Verify:
   - [ ] Webhook received
   - [ ] Subscription created
   - [ ] Plan updated
   - [ ] Usage limits enforced

#### View Usage

1. Navigate to usage section
2. Verify:
   - [ ] Current usage displayed
   - [ ] Limits shown
   - [ ] Period correct

### Integrations

#### Connect Integration

1. Navigate to `/w/:id/integrations`
2. Click "Connect" for Slack/Google/etc.
3. Complete OAuth flow
4. Verify:
   - [ ] Credentials encrypted
   - [ ] Integration saved
   - [ ] Test connection works

#### Use Integration in Workflow

1. Create workflow using integration
2. Execute workflow
3. Verify:
   - [ ] Credentials decrypted
   - [ ] API call succeeds
   - [ ] Data returned

### Security Validation

#### Rate Limiting

1. Make 100+ requests rapidly (Free plan)
2. Verify:
   - [ ] Rate limit headers present
   - [ ] 429 response after limit
   - [ ] Different limits per plan

#### Audit Logging

1. Perform sensitive actions:
   - Login
   - Create workspace
   - Execute workflow
   - Change billing
2. Verify:
   - [ ] Audit logs created
   - [ ] User ID captured
   - [ ] IP address logged
   - [ ] Timestamp correct

#### Security Headers

```bash
curl -I https://your-backend.railway.app/health
```

Verify headers:
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Strict-Transport-Security` (HSTS)
- [ ] `Content-Security-Policy`

#### CORS

1. Make request from frontend
2. Verify:
   - [ ] CORS headers present
   - [ ] Only allowed origins
   - [ ] Credentials allowed

### Performance Validation

#### Response Times

Test key endpoints:

```bash
# Health check
time curl https://your-backend.railway.app/health

# Auth
time curl -X POST https://your-backend.railway.app/api/auth/login ...

# Workflow list
time curl -H "Authorization: Bearer ..." https://your-backend.railway.app/api/workflows
```

Targets:
- [ ] Health: < 100ms
- [ ] Auth: < 500ms
- [ ] Workflow list: < 500ms
- [ ] Workflow execution: < 5s (queued)

#### Caching

1. Make request
2. Check Redis
3. Make same request
4. Verify:
   - [ ] Second request faster
   - [ ] Cache hit logged

#### Database Performance

1. Run queries with EXPLAIN
2. Verify:
   - [ ] Indexes used
   - [ ] No full table scans
   - [ ] Query time < 100ms

### Monitoring Validation

#### Sentry

1. Trigger an error
2. Verify:
   - [ ] Error appears in Sentry
   - [ ] Stack trace captured
   - [ ] User context included
   - [ ] Alert configured

#### Logging

1. Check logs
2. Verify:
   - [ ] Structured JSON format
   - [ ] Request IDs present
   - [ ] User IDs logged
   - [ ] Error stack traces

#### Uptime Monitoring

1. Check monitoring service
2. Verify:
   - [ ] Checks configured
   - [ ] Alerts working
   - [ ] Response times tracked

### Email Validation

#### Verification Email

1. Register new user
2. Verify:
   - [ ] Email sent
   - [ ] Link works
   - [ ] User verified

#### Password Reset

1. Request reset
2. Verify:
   - [ ] Email sent
   - [ ] Link works
   - [ ] Password reset

### Load Testing (Basic)

#### Simple Load Test

```bash
# Install Apache Bench
ab -n 100 -c 10 https://your-backend.railway.app/health
```

Verify:
- [ ] All requests succeed
- [ ] Response time acceptable
- [ ] No errors

### Security Audit Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] Passwords hashed (bcrypt)
- [ ] JWT secrets strong (32+ chars)
- [ ] Encryption key secure (32 chars)
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS protection (input sanitization)
- [ ] CSRF protection (Next.js built-in)
- [ ] Audit logging active
- [ ] Error messages don't leak sensitive info

## Rollback Criteria

Rollback if:
- [ ] Health checks failing
- [ ] Critical errors in logs
- [ ] Database connection issues
- [ ] Authentication not working
- [ ] Data loss detected
- [ ] Security vulnerability found

## Success Criteria

Production is validated when:

- [ ] All infrastructure healthy
- [ ] Authentication flow working
- [ ] Workflow execution working
- [ ] Billing integration working
- [ ] Security measures active
- [ ] Performance acceptable
- [ ] Monitoring operational
- [ ] No critical errors
- [ ] All tests passing

## Post-Validation Tasks

- [ ] Document any issues found
- [ ] Update runbook with learnings
- [ ] Set up regular health checks
- [ ] Configure alerts
- [ ] Schedule security audits
- [ ] Plan capacity scaling

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0

