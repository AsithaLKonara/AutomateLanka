# E2E Testing Guide - Run Tests Locally

## 🚀 Quick Start

### Prerequisites
1. **Backend server running** on `http://localhost:8000`
2. **Frontend server running** on `http://localhost:3000`
3. **Database set up** with test data

### Installation

```bash
cd apps/frontend
npm install
npx playwright install --with-deps chromium
```

### Run Tests

```bash
# Run all E2E tests
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

## 📋 Test Setup

### 1. Start Services

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
# Server should be running on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
# Server should be running on http://localhost:3000
```

**Terminal 3 - Worker (if needed for workflow execution):**
```bash
cd apps/backend
npx tsx src/services/workflowWorker.ts
```

**Terminal 4 - Run Tests:**
```bash
cd apps/frontend
npm run test:e2e
```

### 2. Automatic Server Start

The Playwright config is configured to automatically start both servers if they're not running. Just run:

```bash
npm run test:e2e
```

Playwright will:
- Start backend on `http://localhost:8000`
- Start frontend on `http://localhost:3000`
- Wait for both to be ready
- Run tests
- Clean up servers when done

---

## 🧪 Test Files

### Current Tests

**`apps/frontend/e2e/auth.spec.ts`**
- ✅ User registration
- ✅ User login with valid credentials
- ✅ Error handling for invalid credentials
- ✅ User logout
- ✅ Workflow execution flow

---

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

- **Test Directory**: `./e2e`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 on CI, 0 locally
- **Reports**: HTML report generated in `playwright-report/`

### Environment Variables

Create `.env.local` in `apps/frontend/`:

```bash
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## 📝 Writing New Tests

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate to page
    await page.goto(`${FRONTEND_URL}/your-page`);
    
    // Interact with elements
    await page.click('button');
    await page.fill('input', 'value');
    
    // Assertions
    await expect(page.locator('.element')).toBeVisible();
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

### Best Practices

1. **Use descriptive test names**: "should register a new user" not "test1"
2. **Use data-testid attributes**: Add `data-testid="login-button"` to elements
3. **Wait for elements**: Use `await expect(locator).toBeVisible()`
4. **Clean up**: Reset test data between tests if needed
5. **Use fixtures**: For common setup like login

---

## 🐛 Debugging Tests

### Visual Debugging

```bash
# Run in headed mode to see browser
npm run test:e2e:headed

# Run in UI mode for interactive debugging
npm run test:e2e:ui

# Debug specific test
npm run test:e2e:debug -- auth.spec.ts
```

### Screenshots & Videos

- Screenshots: Automatically saved on failure in `test-results/`
- Videos: Saved on failure (can be large, disabled by default in CI)
- Traces: Available with `--trace on` flag

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 3000 and 8000
   lsof -ti:3000 | xargs kill -9
   lsof -ti:8000 | xargs kill -9
   ```

2. **Tests timeout**
   - Increase timeout in `playwright.config.ts`
   - Check if servers are actually running
   - Verify database connection

3. **Elements not found**
   - Wait for elements: `await page.waitForSelector()`
   - Check if page loaded: `await page.waitForLoadState()`
   - Use `page.pause()` to inspect

---

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

This opens an interactive report showing:
- ✅ Passed tests
- ❌ Failed tests with screenshots
- ⏱️ Test duration
- 📝 Test traces

---

## 🔄 CI/CD Integration

For GitHub Actions, add this workflow:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: cd apps/backend && npm install
      - run: cd apps/frontend && npm install
      - run: cd apps/frontend && npx playwright install --with-deps
      - run: cd apps/frontend && npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: apps/frontend/playwright-report/
```

---

## 🎯 Next Steps

1. **Add more test coverage**:
   - Workflow CRUD operations
   - Workspace management
   - Billing flows
   - Settings pages

2. **Add test fixtures**:
   - Login helper
   - Test user setup
   - Database seeding

3. **Add visual regression tests**:
   - Screenshot comparisons
   - Layout testing

---

**Happy Testing!** 🚀

