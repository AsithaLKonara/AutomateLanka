# How to Run E2E Tests Locally

## ✅ **Quick Start**

```bash
cd apps/frontend
npm run test:e2e
```

This will:
- ✅ Start backend server automatically
- ✅ Start frontend server automatically
- ✅ Run all E2E tests
- ✅ Show test results

---

## 📋 **Prerequisites**

### Option 1: Use Existing Database (Recommended)
If you already have a database running:
```bash
# The tests will use your existing DATABASE_URL from .env
cd apps/frontend
npm run test:e2e
```

### Option 2: Use Test Database
Create a test database first:
```bash
# Create test database
createdb autolanka_test

# Run migrations
cd apps/backend
DATABASE_URL="postgresql://user:pass@localhost:5432/autolanka_test" npx prisma migrate deploy
```

Then run tests:
```bash
cd apps/frontend
TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/autolanka_test" npm run test:e2e
```

---

## 🎯 **Test Commands**

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

---

## 📝 **Current Test Results**

Tests are **running successfully** but may need:
1. ✅ Database set up (PostgreSQL)
2. ✅ Test user created
3. ✅ Test data seeded

---

## 🔧 **Troubleshooting**

### Database Connection Error
If you see: `the URL must start with the protocol postgresql://`

**Fix**: Set `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
npm run test:e2e
```

### Server Won't Start
Check if ports 3000 and 8000 are available:
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Tests Timeout
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 60000, // 60 seconds
}
```

---

## 📊 **Test Coverage**

Current tests:
- ✅ User registration
- ✅ User login
- ✅ Error handling
- ✅ User logout  
- ✅ Workflow execution

---

**Status**: ✅ **Tests are running!** Just need database setup.

