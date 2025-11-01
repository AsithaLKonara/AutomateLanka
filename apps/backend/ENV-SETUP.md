# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in `apps/backend/` with the following variables:

### Database
```
DATABASE_URL="postgresql://user:password@localhost:5432/autolanka_saas?schema=public"
```
For local development with SQLite (simpler setup):
```
DATABASE_URL="file:./dev.db"
```

### JWT Secrets (generate strong random strings)
```
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
```

### Encryption (must be exactly 32 characters)
```
ENCRYPTION_KEY="your-32-char-encryption-key!@#$"
```

### Redis (for Bull queue)
```
REDIS_URL="redis://localhost:6379"
```

### Stripe (Billing)
```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### OAuth Providers (optional for Phase 6)
```
SLACK_CLIENT_ID=""
SLACK_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""
```

### Email (optional for Phase 1)
```
EMAIL_FROM="noreply@autolanka.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
```

### Server
```
PORT=8000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Monitoring (optional)
```
SENTRY_DSN=""
```

## Quick Start for Local Development

For the quickest setup, create `.env` with minimal config:

```env
# Use SQLite for local dev (no PostgreSQL needed)
DATABASE_URL="file:./dev.db"

# Generate these with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="abc123...your-secret-here"
REFRESH_SECRET="def456...your-secret-here"
ENCRYPTION_KEY="12345678901234567890123456789012"

# Not needed until Phase 5 (workflow execution)
REDIS_URL="redis://localhost:6379"

# Basic server config
PORT=8000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## Setup Instructions

1. Copy this template to `.env`
2. Generate secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. For PostgreSQL, set up database:
   ```bash
   # Using Railway (recommended for production)
   # 1. Create Railway project
   # 2. Add PostgreSQL service
   # 3. Copy DATABASE_URL from Railway dashboard
   
   # OR using local PostgreSQL
   createdb autolanka_saas
   ```
4. Run migrations:
   ```bash
   npm run db:migrate
   ```

