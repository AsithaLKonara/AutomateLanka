# 🚀 AutomateLanka SaaS Transformation - Master Plan

## 📋 Executive Summary

Transform AutomateLanka from a workflow browser into a **full multi-tenant SaaS platform** where users can:
- ✅ Sign up and create workspaces
- ✅ Import, create, and manage workflows
- ✅ **Execute workflows directly in the platform** (not just download)
- ✅ Invite team members (multi-tenant)
- ✅ Connect integrations (Slack, Gmail, etc.)
- ✅ Subscribe to plans and track usage
- ✅ Access via APIs and webhooks

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│         Next.js Frontend (Port 3000)                        │
│    - Public pages (/, /ai-search, /workflows)              │
│    - Auth pages (/auth/login, /auth/register)              │
│    - Workspace pages (/w/:id/dashboard, /w/:id/workflows)  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP/HTTPS + JWT Auth
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              NEXT.JS API ROUTES                             │
│   - Proxy to backend                                        │
│   - SSR for SEO                                             │
│   - API: /api/auth/*, /api/workflows/*, /api/billing/*     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Internal API Calls
                  │
┌─────────────────▼───────────────────────────────────────────┐
│         NODE.JS BACKEND (Express/Fastify)                   │
│  apps/backend/src/                                          │
│   - Auth service (JWT + refresh tokens)                     │
│   - Workspace service                                       │
│   - Workflow CRUD                                           │
│   - Smart search                                            │
│   - Billing integration (Stripe)                            │
│   - Integration management                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
         ┌────────┴────────┬──────────────┐
         │                 │              │
         ▼                 ▼              ▼
┌─────────────────┐ ┌────────────┐ ┌──────────────┐
│   POSTGRES DB   │ │   REDIS    │ │ OBJECT STORE │
│   (or SQLite)   │ │  (Queue +  │ │  (S3/Local)  │
│                 │ │   Cache)   │ │              │
│  • users        │ │            │ │ • Workflow   │
│  • workspaces   │ │ • Job queue│ │   JSON files │
│  • memberships  │ │ • Sessions │ │ • Run logs   │
│  • workflows    │ │ • Rate lim │ │ • Exports    │
│  • runs         │ └────────────┘ └──────────────┘
│  • integrations │
│  • plans        │
│  • invoices     │
└─────────────────┘
         │
         │ Job Queue (Redis/Bull)
         │
         ▼
┌──────────────────────────────────────────┐
│      WORKFLOW RUNTIME WORKERS            │
│  (Separate process/container)            │
│                                          │
│  • Pick jobs from queue                  │
│  • Execute workflow nodes                │
│  • Handle integrations                   │
│  • Write logs & results                  │
│  • Resource isolation & sandboxing       │
└──────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Core Tables)

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user', -- user, admin
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);
```

### Workspaces (Tenant)
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES plans(id),
  slug VARCHAR(100) UNIQUE, -- for URL: /w/my-company
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Memberships (User ↔ Workspace)
```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  workspace_id UUID REFERENCES workspaces(id),
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  UNIQUE(user_id, workspace_id)
);
```

### Workflows (Multi-tenant)
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  filename VARCHAR(255),
  json JSONB NOT NULL, -- Full n8n workflow definition
  active BOOLEAN DEFAULT false,
  public BOOLEAN DEFAULT false, -- Allow public discovery
  tags TEXT[],
  nodes_count INTEGER,
  integrations TEXT[],
  category VARCHAR(100),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  popularity INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0
);

CREATE INDEX idx_workflows_workspace ON workflows(workspace_id);
CREATE INDEX idx_workflows_active ON workflows(active);
CREATE INDEX idx_workflows_public ON workflows(public);
```

### Workflow Runs (Execution History)
```sql
CREATE TABLE runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  workspace_id UUID REFERENCES workspaces(id),
  triggered_by UUID REFERENCES users(id),
  trigger_type VARCHAR(50), -- manual, webhook, schedule
  status VARCHAR(50) DEFAULT 'queued', -- queued, running, success, failed, cancelled
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  duration_ms INTEGER,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  logs TEXT,
  node_executions INTEGER DEFAULT 0, -- for billing
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_runs_workflow ON runs(workflow_id);
CREATE INDEX idx_runs_workspace ON runs(workspace_id);
CREATE INDEX idx_runs_status ON runs(status);
```

### Integrations (Connected Services)
```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  type VARCHAR(100) NOT NULL, -- slack, gmail, sheets, etc.
  name VARCHAR(255),
  encrypted_credentials TEXT NOT NULL, -- Store encrypted OAuth tokens/API keys
  metadata JSONB, -- Extra config
  connected_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);
```

### Plans (Billing)
```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, -- Free, Pro, Business
  slug VARCHAR(50) UNIQUE,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  runs_per_month INTEGER,
  max_workflows INTEGER,
  max_members INTEGER,
  features JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  plan_id UUID REFERENCES plans(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50), -- active, cancelled, past_due
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Usage (Metering)
```sql
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  period_start DATE,
  period_end DATE,
  runs_count INTEGER DEFAULT 0,
  node_executions INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Keys
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  key_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  scopes TEXT[], -- workflow:read, workflow:execute
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🌐 API Surface (Complete Routes)

### Authentication (`/api/auth/*`)
```
POST   /api/auth/register          - Register user + create workspace
POST   /api/auth/login             - Login with email/password
POST   /api/auth/refresh           - Refresh access token
POST   /api/auth/logout            - Logout & revoke tokens
POST   /api/auth/forgot-password   - Send reset email
POST   /api/auth/reset-password    - Reset with token
GET    /api/auth/verify-email      - Verify email with token
```

### Workspaces (`/api/workspaces/*`)
```
GET    /api/workspaces             - List user's workspaces
POST   /api/workspaces             - Create new workspace
GET    /api/workspaces/:id         - Get workspace details
PUT    /api/workspaces/:id         - Update workspace
DELETE /api/workspaces/:id         - Delete workspace (owner only)
POST   /api/workspaces/:id/invite  - Invite member
GET    /api/workspaces/:id/members - List members
DELETE /api/workspaces/:id/members/:userId - Remove member
```

### Workflows (`/api/workflows/*`)
```
GET    /api/workflows/stats        - Global stats (homepage)
GET    /api/workflows              - List/search workflows
POST   /api/workflows              - Create workflow
GET    /api/workflows/:id          - Get workflow details
PUT    /api/workflows/:id          - Update workflow
DELETE /api/workflows/:id          - Delete workflow
POST   /api/workflows/import       - Import n8n JSON
POST   /api/workflows/:id/clone    - Clone workflow
POST   /api/workflows/:id/activate - Activate/deactivate
GET    /api/workflows/:id/download - Download JSON
POST   /api/workflows/:id/run      - Execute workflow
GET    /api/workflows/:id/versions - Get version history
```

### Runs (`/api/runs/*`)
```
GET    /api/runs                   - List runs (paginated)
GET    /api/runs/:id               - Get run details + logs
POST   /api/runs/:id/cancel        - Cancel running workflow
DELETE /api/runs/:id               - Delete run record
```

### Smart Search (`/api/ai-search/*`)
```
GET    /api/ai-search/semantic     - Semantic search with scoring
GET    /api/ai-search/similar/:id  - Find similar workflows
GET    /api/ai-search/suggestions  - Search suggestions
GET    /api/ai-search/recommend    - Personalized recommendations
```

### Integrations (`/api/integrations/*`)
```
GET    /api/integrations           - List workspace integrations
POST   /api/integrations/:type/connect - Connect service (OAuth/API key)
DELETE /api/integrations/:id       - Disconnect integration
POST   /api/integrations/:id/test  - Test connection
```

### Billing (`/api/billing/*`)
```
GET    /api/billing/plans          - List available plans
POST   /api/billing/subscribe      - Create Stripe checkout
POST   /api/billing/portal         - Get Stripe customer portal URL
GET    /api/billing/invoices       - List invoices
GET    /api/billing/usage          - Get current usage
POST   /api/billing/webhook        - Stripe webhook handler
```

### API Keys (`/api/api-keys/*`)
```
GET    /api/api-keys               - List workspace API keys
POST   /api/api-keys               - Create new API key
DELETE /api/api-keys/:id           - Revoke API key
```

### Webhooks (`/api/webhooks/*`)
```
POST   /api/webhooks/:workspaceId/:workflowId/:webhookKey
       - Public webhook endpoint for workflow triggers
```

### Admin (`/api/admin/*`)
```
GET    /api/admin/stats            - System statistics
GET    /api/admin/users            - List all users
GET    /api/admin/workspaces       - List all workspaces
POST   /api/admin/impersonate      - Impersonate user
```

---

## 🎨 Frontend Routes (Next.js App Router)

### Public Routes
```
/                              - Homepage (animated, stats)
/ai-search                     - AI-powered search (guest mode)
/n8n-workflows                 - Browse public workflows
/workflows/:id                 - Public workflow detail
/auth/login                    - Login page
/auth/register                 - Registration page
/auth/forgot-password          - Password reset
/auth/verify-email/:token      - Email verification
/pricing                       - Pricing plans
/docs                          - Documentation
```

### Authenticated Routes
```
/w/:workspaceId/dashboard              - Workspace dashboard
/w/:workspaceId/workflows              - Workflows list (grid/list)
/w/:workspaceId/workflows/new          - Create workflow
/w/:workspaceId/workflows/:id          - Workflow detail + editor
/w/:workspaceId/workflows/:id/edit     - Visual workflow editor
/w/:workspaceId/workflows/:id/runs     - Run history
/w/:workspaceId/runs                   - All runs history
/w/:workspaceId/integrations           - Connected services
/w/:workspaceId/integrations/connect   - Connect new service
/w/:workspaceId/billing                - Billing & subscription
/w/:workspaceId/settings               - Workspace settings
/w/:workspaceId/settings/members       - Team members
/w/:workspaceId/settings/api-keys      - API keys management
/w/:workspaceId/settings/webhooks      - Webhook endpoints
```

---

## ⚙️ Workflow Runtime (Execution Engine)

### Architecture
```
┌─────────────────────────────────────────────┐
│         USER TRIGGERS WORKFLOW              │
│  POST /api/workflows/:id/run                │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│       CREATE RUN RECORD IN DB               │
│  status: 'queued'                           │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│      ENQUEUE JOB TO REDIS/BULL              │
│  { runId, workflowId, workspaceId }         │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│       WORKER PICKS UP JOB                   │
│  (Separate Node.js process)                 │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│     FETCH WORKFLOW JSON FROM DB             │
│     FETCH CREDENTIALS (decrypt)             │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│    EXECUTE NODES IN ORDER/GRAPH             │
│  • HTTP Request                             │
│  • Data Transform                           │
│  • Slack API Call                           │
│  • Gmail API Call                           │
│  • Conditional Logic                        │
│  • Loops & Aggregation                      │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│     UPDATE RUN STATUS IN DB                 │
│  status: 'success' or 'failed'              │
│  Save logs, output, duration                │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│    INCREMENT USAGE COUNTER                  │
│  (for billing metering)                     │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│    SEND NOTIFICATION TO FRONTEND            │
│  (WebSocket or polling)                     │
└─────────────────────────────────────────────┘
```

### Security & Isolation
- Run each workflow in a **separate child process** or **Docker container**
- **Network restrictions**: Whitelist external APIs
- **Timeout limits**: Kill long-running workflows
- **Resource limits**: CPU/Memory caps per workspace plan
- **Credential encryption**: Use KMS (AWS KMS or local encryption)
- **Logging**: Sanitize secrets from logs

---

## 💳 Billing & Usage (Stripe Integration)

### Plans
```javascript
const PLANS = [
  {
    name: 'Free',
    slug: 'free',
    price_monthly: 0,
    runs_per_month: 100,
    max_workflows: 5,
    max_members: 1
  },
  {
    name: 'Pro',
    slug: 'pro',
    price_monthly: 29,
    runs_per_month: 10000,
    max_workflows: 100,
    max_members: 10
  },
  {
    name: 'Business',
    slug: 'business',
    price_monthly: 99,
    runs_per_month: 100000,
    max_workflows: -1, // unlimited
    max_members: -1
  }
];
```

### Metering Flow
1. User triggers workflow run
2. Worker executes and increments usage counter
3. Middleware checks if workspace exceeded plan limits
4. If exceeded, return 429 (rate limited) or upgrade prompt
5. Daily/monthly cron job creates usage records
6. Stripe webhook updates subscription status

### Stripe Webhook Events
```
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

---

## 🔐 Security Checklist

- [ ] Hash passwords with bcrypt/argon2
- [ ] JWT access tokens (15min) + refresh tokens (30 days)
- [ ] Store refresh tokens in DB for revocation
- [ ] Email verification required
- [ ] Rate limiting (per IP + per workspace)
- [ ] CORS configuration
- [ ] CSRF protection (Next.js built-in)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (sanitize inputs)
- [ ] Encrypt credentials at rest (AES-256)
- [ ] Use KMS for encryption keys
- [ ] HTTPS only in production
- [ ] Security headers (Helmet.js)
- [ ] API key authentication option
- [ ] Webhook signature verification
- [ ] Audit logs for sensitive actions
- [ ] GDPR compliance (data export/deletion)

---

## 📅 Implementation Roadmap

### Phase 1: Foundation (2-3 weeks)
**Goal**: Authentication + Workspaces + Basic UI

- [ ] Set up Postgres database (or keep SQLite for MVP)
- [ ] Implement user registration/login/JWT
- [ ] Create workspace model + memberships
- [ ] Build Next.js auth pages (login/register)
- [ ] Add workspace switcher to header
- [ ] Protected routes middleware
- [ ] Database migrations system

**Deliverable**: Users can sign up, create workspaces, invite members

---

### Phase 2: Workflow Management (2-3 weeks)
**Goal**: CRUD operations for workflows

- [ ] Workflow CRUD API endpoints
- [ ] Import n8n JSON files
- [ ] Workflow editor UI (metadata + JSON upload)
- [ ] Browse workflows (workspace-scoped)
- [ ] Filter/search/pagination
- [ ] Download workflow JSON
- [ ] Clone workflow feature
- [ ] Public/private workflow toggle

**Deliverable**: Users can upload, manage, and browse workflows

---

### Phase 3: Smart Search (1-2 weeks)
**Goal**: AI-powered search within workspace

- [ ] Port existing FTS5 search to multi-tenant
- [ ] Add workspace_id filtering
- [ ] Semantic search API
- [ ] Similar workflows finder
- [ ] Search suggestions
- [ ] Frontend AI search page (workspace-scoped)

**Deliverable**: Users can search their workflows intelligently

---

### Phase 4: Workflow Execution (3-4 weeks) ⭐ **CRITICAL**
**Goal**: Run workflows inside the platform

- [ ] Set up Redis/Bull queue
- [ ] Create worker process architecture
- [ ] Implement node handlers:
  - [ ] HTTP Request
  - [ ] Webhook trigger
  - [ ] Data transformation
  - [ ] Conditional logic
  - [ ] Slack integration
  - [ ] Gmail integration
  - [ ] Google Sheets
- [ ] Run model + database schema
- [ ] Execution logs storage
- [ ] Real-time run status updates
- [ ] Cancel/retry functionality
- [ ] Resource limits enforcement
- [ ] Error handling & reporting

**Deliverable**: Users can execute workflows directly in platform

---

### Phase 5: Integrations (2-3 weeks)
**Goal**: Connect external services

- [ ] Integration model + encrypted storage
- [ ] OAuth 2.0 flow (Slack, Google, GitHub)
- [ ] API key storage (encrypted)
- [ ] Integration connection UI
- [ ] Test connection endpoints
- [ ] Use integrations in workflow execution
- [ ] Credential refresh logic

**Deliverable**: Users can connect real services to workflows

---

### Phase 6: Billing (2 weeks)
**Goal**: Monetization + usage limits

- [ ] Stripe integration
- [ ] Plans table + seeding
- [ ] Subscription checkout flow
- [ ] Customer portal (manage billing)
- [ ] Webhook handling
- [ ] Usage metering
- [ ] Enforce plan limits (runs, workflows, members)
- [ ] Upgrade/downgrade logic
- [ ] Invoice generation

**Deliverable**: Users can subscribe and platform tracks usage

---

### Phase 7: Polish & Production (2-3 weeks)
**Goal**: Production-ready platform

- [ ] Admin dashboard
- [ ] System monitoring (Sentry, Prometheus)
- [ ] Logging system (Winston)
- [ ] Email notifications (SendGrid/Postmark)
- [ ] API keys management
- [ ] Webhook endpoints for external triggers
- [ ] Public API documentation
- [ ] Mobile-responsive UI
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Deployment automation (CI/CD)
- [ ] Backup strategy

**Deliverable**: Production-ready SaaS platform

---

## 🎯 Success Metrics (MVP)

After completion, the platform should support:

- ✅ 100+ registered users
- ✅ Multi-tenant architecture (workspace isolation)
- ✅ 10+ workflow executions per minute
- ✅ Sub-100ms API response time
- ✅ 99.9% uptime
- ✅ Successful Stripe payment processing
- ✅ OAuth integrations working
- ✅ Secure credential storage
- ✅ Real-time execution logs
- ✅ Mobile-responsive UI

---

## 📚 Tech Stack Summary

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State**: Zustand or React Context
- **API**: Next.js API Routes + SWR/React Query

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js or Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL (or SQLite for dev)
- **ORM**: Prisma
- **Queue**: Bull (Redis)
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **Testing**: Jest + Supertest

### Infrastructure
- **Hosting**: Vercel (frontend) + Railway/Render (backend)
- **Database**: Supabase or Railway Postgres
- **Redis**: Upstash or Railway Redis
- **Storage**: AWS S3 or Vercel Blob
- **Monitoring**: Sentry + Vercel Analytics
- **Email**: SendGrid or Postmark
- **Billing**: Stripe

---

## 🚀 Next Steps

1. **Decide on database**: Migrate to Postgres or continue with SQLite?
2. **Set up Prisma**: Define schemas and generate migrations
3. **Implement authentication**: Start with Phase 1
4. **Create workspace model**: Multi-tenancy foundation
5. **Build protected frontend**: Workspace dashboard

**Are you ready to start? Which phase should we begin with?** 🎯

---

## 💡 Optional Enhancements (Future)

- Visual workflow editor (canvas-based)
- Scheduled workflow execution (cron)
- Workflow templates marketplace
- Team collaboration features
- Workflow sharing & publishing
- A/B testing for workflows
- Analytics dashboard
- Workflow versioning & rollback
- Import from Zapier/Make.com
- Mobile app (React Native)
- SSO (SAML/OAuth)
- White-label option
- Workflow testing framework
- GraphQL API
- Realtime collaboration

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-01  
**Status**: Ready for Implementation 🚀

