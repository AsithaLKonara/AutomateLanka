# API Documentation

## Base URL

**Production**: `https://your-backend.railway.app`  
**Development**: `http://localhost:8000`

## Authentication

Most endpoints require authentication via JWT Bearer token.

### Getting an Access Token

1. Register or login to get `accessToken` and `refreshToken`
2. Include access token in requests:
   ```
   Authorization: Bearer <accessToken>
   ```

### Refreshing Tokens

Access tokens expire after 15 minutes. Use the refresh token to get a new access token:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

## Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "workspaceName": "My Workspace" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "workspace": {
      "id": "workspace-id",
      "name": "My Workspace",
      "slug": "my-workspace-abc"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as register

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-access-token"
  }
}
```

#### Logout

```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-id",
    "email": "user@example.com",
    "workspaceId": "workspace-id",
    "role": "user"
  }
}
```

### Workspaces

#### List Workspaces

```http
GET /api/workspaces
Authorization: Bearer <accessToken>
```

#### Get Workspace

```http
GET /api/workspaces/:id
Authorization: Bearer <accessToken>
```

#### Create Workspace

```http
POST /api/workspaces
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "New Workspace",
  "slug": "new-workspace" // optional, auto-generated if not provided
}
```

#### Update Workspace

```http
PUT /api/workspaces/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete Workspace

```http
DELETE /api/workspaces/:id
Authorization: Bearer <accessToken>
```

#### Invite Member

```http
POST /api/workspaces/:id/invite
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "email": "member@example.com",
  "role": "member" // owner, admin, member
}
```

### Workflows

#### List Workflows

```http
GET /api/workflows?workspaceId=workspace-id
Authorization: Bearer <accessToken>
```

**Query Parameters:**
- `workspaceId` (required): Workspace ID
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (default: 20)
- `active` (optional): Filter by active status (true/false)
- `search` (optional): Search query

#### Get Workflow

```http
GET /api/workflows/:id
Authorization: Bearer <accessToken>
```

#### Create Workflow

```http
POST /api/workflows
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "My Workflow",
  "json": { /* n8n workflow JSON */ },
  "active": false,
  "public": false,
  "tags": ["automation", "webhook"]
}
```

#### Update Workflow

```http
PUT /api/workflows/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Updated Name",
  "json": { /* updated workflow JSON */ },
  "active": true
}
```

#### Delete Workflow

```http
DELETE /api/workflows/:id
Authorization: Bearer <accessToken>
```

#### Execute Workflow

```http
POST /api/workflows/:id/run
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "inputData": { /* optional input data */ }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "runId": "run-id",
    "status": "queued"
  }
}
```

#### Get Run Status

```http
GET /api/runs/:id
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "run-id",
    "status": "success", // queued, running, success, failed, cancelled
    "startedAt": "2025-01-XX...",
    "finishedAt": "2025-01-XX...",
    "durationMs": 1234,
    "logs": "execution logs...",
    "outputData": { /* workflow output */ }
  }
}
```

### Billing

#### Get Plans

```http
GET /api/saas-billing/plans
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "plan-id",
      "name": "Free",
      "slug": "free",
      "priceMonthly": 0,
      "runsPerMonth": 100,
      "maxWorkflows": 5,
      "maxMembers": 1
    },
    {
      "id": "plan-id",
      "name": "Pro",
      "slug": "pro",
      "priceMonthly": 29,
      "runsPerMonth": 10000,
      "maxWorkflows": 100,
      "maxMembers": 10
    }
  ]
}
```

#### Subscribe to Plan

```http
POST /api/saas-billing/subscribe
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "planId": "plan-id",
  "paymentMethodId": "pm_..." // Stripe payment method ID
}
```

#### Get Usage

```http
GET /api/saas-billing/usage?workspaceId=workspace-id
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "runsCount": 45,
    "nodeExecutions": 1234,
    "apiCalls": 567,
    "periodStart": "2025-01-01",
    "periodEnd": "2025-01-31",
    "plan": {
      "runsPerMonth": 100,
      "maxWorkflows": 5
    }
  }
}
```

### Integrations

#### List Integrations

```http
GET /api/integrations?workspaceId=workspace-id
Authorization: Bearer <accessToken>
```

#### Connect Integration

```http
POST /api/integrations/:type/connect
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "credentials": { /* OAuth tokens or API keys */ }
}
```

**Supported Types:**
- `slack`
- `gmail`
- `github`
- `microsoft`

#### Disconnect Integration

```http
DELETE /api/integrations/:id
Authorization: Bearer <accessToken>
```

## Error Responses

All errors follow this format:

```json
{
  "error": "ErrorCode",
  "message": "Human-readable error message",
  "details": { /* optional additional details */ }
}
```

### Common Error Codes

- `ValidationError`: Invalid input data
- `Unauthorized`: Missing or invalid authentication
- `Forbidden`: Insufficient permissions
- `NotFound`: Resource not found
- `Conflict`: Resource already exists
- `RateLimitExceeded`: Too many requests
- `PlanLimitExceeded`: Plan limit reached
- `ServerError`: Internal server error

## Rate Limiting

Rate limits are applied per workspace based on plan:

- **Free**: 100 requests/minute
- **Pro**: 1,000 requests/minute
- **Business**: 10,000 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Stripe Webhooks

Stripe sends webhooks to:
```
POST /api/saas-billing/webhook
```

**Events Handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Workflow Webhooks

Public webhook endpoints for triggering workflows:
```
POST /api/webhooks/:workspaceId/:workflowId/:webhookKey
```

## Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "version": "1.0.0"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
const API_URL = 'https://your-backend.railway.app';

async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  return data.data;
}

async function executeWorkflow(workflowId: string, accessToken: string) {
  const response = await fetch(`${API_URL}/api/workflows/${workflowId}/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputData: {} }),
  });
  return response.json();
}
```

### cURL

```bash
# Login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Execute Workflow
curl -X POST https://your-backend.railway.app/api/workflows/workflow-id/run \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"inputData":{}}'
```

## Support

For API support, contact: support@automatelanka.com

---

**Last Updated**: 2025-01-XX  
**API Version**: 1.0.0

