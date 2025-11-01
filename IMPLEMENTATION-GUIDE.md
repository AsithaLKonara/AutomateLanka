# 🛠️ AutomateLanka SaaS - Implementation Guide

## 📋 Quick Reference

This guide provides **concrete code examples** to implement the SaaS transformation.

---

## 1️⃣ Database Setup with Prisma

### Install Prisma

```bash
cd apps/backend
npm install prisma @prisma/client
npx prisma init
```

### Prisma Schema (`apps/backend/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite" for dev
  url      = env("DATABASE_URL")
}

// ============ USER & AUTH ============
model User {
  id            String        @id @default(uuid())
  email         String        @unique
  passwordHash  String        @map("password_hash")
  name          String?
  role          String        @default("user") // user, admin
  isVerified    Boolean       @default(false) @map("is_verified")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  lastLoginAt   DateTime?     @map("last_login_at")
  
  ownedWorkspaces Workspace[] @relation("WorkspaceOwner")
  memberships     Membership[]
  workflows       Workflow[]
  runs            Run[]
  integrations    Integration[]
  
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  
  @@map("refresh_tokens")
}

// ============ WORKSPACE (TENANT) ============
model Workspace {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  ownerId   String   @map("owner_id")
  planId    String?  @map("plan_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  owner         User          @relation("WorkspaceOwner", fields: [ownerId], references: [id])
  plan          Plan?         @relation(fields: [planId], references: [id])
  memberships   Membership[]
  workflows     Workflow[]
  runs          Run[]
  integrations  Integration[]
  subscription  Subscription?
  usageRecords  UsageRecord[]
  apiKeys       ApiKey[]
  
  @@map("workspaces")
}

model Membership {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  workspaceId String    @map("workspace_id")
  role        String    @default("member") // owner, admin, member
  invitedBy   String?   @map("invited_by")
  invitedAt   DateTime  @default(now()) @map("invited_at")
  acceptedAt  DateTime? @map("accepted_at")
  
  user      User      @relation(fields: [userId], references: [id])
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  
  @@unique([userId, workspaceId])
  @@map("memberships")
}

// ============ WORKFLOWS ============
model Workflow {
  id            String   @id @default(uuid())
  workspaceId   String   @map("workspace_id")
  name          String
  filename      String?
  json          Json     // Full n8n workflow definition
  active        Boolean  @default(false)
  public        Boolean  @default(false)
  tags          String[]
  nodesCount    Int      @default(0) @map("nodes_count")
  integrations  String[]
  category      String?
  createdBy     String   @map("created_by")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  popularity    Int      @default(0)
  usageCount    Int      @default(0) @map("usage_count")
  
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  creator   User      @relation(fields: [createdBy], references: [id])
  runs      Run[]
  versions  WorkflowVersion[]
  
  @@index([workspaceId])
  @@index([active])
  @@index([public])
  @@map("workflows")
}

model WorkflowVersion {
  id         String   @id @default(uuid())
  workflowId String   @map("workflow_id")
  version    Int
  json       Json
  note       String?
  createdAt  DateTime @default(now()) @map("created_at")
  
  workflow Workflow @relation(fields: [workflowId], references: [id])
  
  @@unique([workflowId, version])
  @@map("workflow_versions")
}

// ============ RUNS (EXECUTIONS) ============
model Run {
  id              String    @id @default(uuid())
  workflowId      String    @map("workflow_id")
  workspaceId     String    @map("workspace_id")
  triggeredBy     String?   @map("triggered_by")
  triggerType     String?   @map("trigger_type") // manual, webhook, schedule
  status          String    @default("queued") // queued, running, success, failed, cancelled
  startedAt       DateTime? @map("started_at")
  finishedAt      DateTime? @map("finished_at")
  durationMs      Int?      @map("duration_ms")
  inputData       Json?     @map("input_data")
  outputData      Json?     @map("output_data")
  errorMessage    String?   @map("error_message")
  logs            String?
  nodeExecutions  Int       @default(0) @map("node_executions")
  createdAt       DateTime  @default(now()) @map("created_at")
  
  workflow  Workflow  @relation(fields: [workflowId], references: [id])
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  user      User?     @relation(fields: [triggeredBy], references: [id])
  
  @@index([workflowId])
  @@index([workspaceId])
  @@index([status])
  @@map("runs")
}

// ============ INTEGRATIONS ============
model Integration {
  id                   String    @id @default(uuid())
  workspaceId          String    @map("workspace_id")
  type                 String    // slack, gmail, sheets, etc.
  name                 String?
  encryptedCredentials String    @map("encrypted_credentials")
  metadata             Json?
  connectedBy          String    @map("connected_by")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  lastUsedAt           DateTime? @map("last_used_at")
  
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  user      User      @relation(fields: [connectedBy], references: [id])
  
  @@map("integrations")
}

// ============ BILLING ============
model Plan {
  id             String  @id @default(uuid())
  name           String
  slug           String  @unique
  priceMonthly   Decimal @map("price_monthly")
  priceYearly    Decimal @map("price_yearly")
  runsPerMonth   Int     @map("runs_per_month")
  maxWorkflows   Int     @map("max_workflows")
  maxMembers     Int     @map("max_members")
  features       Json?
  createdAt      DateTime @default(now()) @map("created_at")
  
  workspaces    Workspace[]
  subscriptions Subscription[]
  
  @@map("plans")
}

model Subscription {
  id                    String    @id @default(uuid())
  workspaceId           String    @unique @map("workspace_id")
  planId                String    @map("plan_id")
  stripeSubscriptionId  String?   @map("stripe_subscription_id")
  status                String    // active, cancelled, past_due
  currentPeriodStart    DateTime  @map("current_period_start")
  currentPeriodEnd      DateTime  @map("current_period_end")
  cancelAtPeriodEnd     Boolean   @default(false) @map("cancel_at_period_end")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  plan      Plan      @relation(fields: [planId], references: [id])
  
  @@map("subscriptions")
}

model UsageRecord {
  id              String   @id @default(uuid())
  workspaceId     String   @map("workspace_id")
  periodStart     DateTime @map("period_start")
  periodEnd       DateTime @map("period_end")
  runsCount       Int      @default(0) @map("runs_count")
  nodeExecutions  Int      @default(0) @map("node_executions")
  apiCalls        Int      @default(0) @map("api_calls")
  createdAt       DateTime @default(now()) @map("created_at")
  
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  
  @@map("usage_records")
}

// ============ API KEYS ============
model ApiKey {
  id          String    @id @default(uuid())
  workspaceId String    @map("workspace_id")
  keyHash     String    @map("key_hash")
  name        String?
  scopes      String[]
  lastUsedAt  DateTime? @map("last_used_at")
  expiresAt   DateTime? @map("expires_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  
  workspace Workspace @relation(fields: [workspaceId], references: [id])
  
  @@map("api_keys")
}
```

### Generate and Migrate

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## 2️⃣ Authentication (JWT + Refresh Tokens)

### Install Dependencies

```bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

### Auth Service (`apps/backend/src/services/authService.ts`)

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';

interface TokenPayload {
  userId: string;
  email: string;
  workspaceId?: string;
}

export class AuthService {
  // Register new user
  async register(email: string, password: string, name: string, workspaceName?: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + workspace + membership in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
        },
      });

      const slug = this.generateSlug(workspaceName || `${name}'s Workspace`);
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName || `${name}'s Workspace`,
          slug,
          ownerId: user.id,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'owner',
          acceptedAt: new Date(),
        },
      });

      return { user, workspace };
    });

    // Generate tokens
    const tokens = await this.generateTokens(result.user.id, result.user.email, result.workspace.id);

    return {
      user: result.user,
      workspace: result.workspace,
      ...tokens,
    };
  }

  // Login
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Get default workspace
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      include: { workspace: true },
      orderBy: { acceptedAt: 'desc' },
    });

    if (!membership) {
      throw new Error('No workspace found');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, membership.workspaceId);

    return {
      user,
      workspace: membership.workspace,
      ...tokens,
    };
  }

  // Generate access + refresh tokens
  async generateTokens(userId: string, email: string, workspaceId: string) {
    const accessToken = jwt.sign(
      { userId, email, workspaceId } as TokenPayload,
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return { accessToken, refreshToken };
  }

  // Refresh access token
  async refresh(refreshToken: string) {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { userId: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: tokenRecord.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Get workspace
    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
    });

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, workspaceId: membership?.workspaceId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return { accessToken };
  }

  // Logout (revoke refresh token)
  async logout(refreshToken: string) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
  }

  // Verify JWT
  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + crypto.randomBytes(3).toString('hex');
  }
}
```

### Auth Routes (`apps/backend/src/routes/auth.ts`)

```typescript
import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';

const router = Router();
const authService = new AuthService();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, workspaceName } = req.body;
    const result = await authService.register(email, password, name, workspaceName);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
```

### Auth Middleware (`apps/backend/src/middleware/authMiddleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    workspaceId: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 3️⃣ Workflow Execution (Worker + Queue)

### Install Dependencies

```bash
npm install bull ioredis
npm install -D @types/bull
```

### Worker Service (`apps/backend/src/services/workflowWorker.ts`)

```typescript
import Queue from 'bull';
import { PrismaClient } from '@prisma/client';
import { WorkflowExecutor } from './workflowExecutor';

const prisma = new PrismaClient();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create queue
export const workflowQueue = new Queue('workflow-execution', REDIS_URL);

// Process jobs
workflowQueue.process(async (job) => {
  const { runId } = job.data;
  
  console.log(`Processing run: ${runId}`);
  
  try {
    // Update status to running
    await prisma.run.update({
      where: { id: runId },
      data: { status: 'running', startedAt: new Date() },
    });

    // Fetch run details
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: { workflow: true, workspace: true },
    });

    if (!run) {
      throw new Error('Run not found');
    }

    // Execute workflow
    const executor = new WorkflowExecutor(run.workflow.json, run.workspace.id);
    const result = await executor.execute(run.inputData);

    // Update run with results
    await prisma.run.update({
      where: { id: runId },
      data: {
        status: 'success',
        finishedAt: new Date(),
        durationMs: Date.now() - run.startedAt!.getTime(),
        outputData: result.output,
        logs: result.logs.join('\n'),
        nodeExecutions: result.nodeExecutions,
      },
    });

    // Update usage
    await incrementUsage(run.workspaceId, result.nodeExecutions);

    return { success: true, runId };
  } catch (error: any) {
    console.error(`Run ${runId} failed:`, error);
    
    await prisma.run.update({
      where: { id: runId },
      data: {
        status: 'failed',
        finishedAt: new Date(),
        errorMessage: error.message,
      },
    });

    throw error;
  }
});

async function incrementUsage(workspaceId: string, nodeExecutions: number) {
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  await prisma.usageRecord.upsert({
    where: {
      workspaceId_periodStart: { workspaceId, periodStart },
    },
    update: {
      runsCount: { increment: 1 },
      nodeExecutions: { increment: nodeExecutions },
    },
    create: {
      workspaceId,
      periodStart,
      periodEnd,
      runsCount: 1,
      nodeExecutions,
    },
  });
}
```

### Workflow Executor (Simplified) (`apps/backend/src/services/workflowExecutor.ts`)

```typescript
export class WorkflowExecutor {
  constructor(
    private workflowJson: any,
    private workspaceId: string
  ) {}

  async execute(inputData: any) {
    const logs: string[] = [];
    let nodeExecutions = 0;
    let output: any = {};

    try {
      const nodes = this.workflowJson.nodes || [];
      
      for (const node of nodes) {
        logs.push(`Executing node: ${node.name} (${node.type})`);
        nodeExecutions++;

        const result = await this.executeNode(node, inputData);
        output[node.name] = result;
        
        logs.push(`Node ${node.name} completed`);
      }

      return { output, logs, nodeExecutions };
    } catch (error: any) {
      logs.push(`Error: ${error.message}`);
      throw error;
    }
  }

  private async executeNode(node: any, input: any) {
    // Simplified node execution
    switch (node.type) {
      case 'n8n-nodes-base.httpRequest':
        return await this.executeHttpRequest(node);
      case 'n8n-nodes-base.slack':
        return await this.executeSlack(node);
      // Add more node handlers
      default:
        return { message: 'Node type not implemented' };
    }
  }

  private async executeHttpRequest(node: any) {
    // Implement HTTP request logic
    return { status: 'success' };
  }

  private async executeSlack(node: any) {
    // Implement Slack API call
    return { status: 'message sent' };
  }
}
```

### Run Workflow Endpoint (`apps/backend/src/routes/runs.ts`)

```typescript
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';
import { workflowQueue } from '../services/workflowWorker';

const router = Router();
const prisma = new PrismaClient();

// Start workflow run
router.post('/:workflowId/run', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { workflowId } = req.params;
    const { inputData } = req.body;

    // Fetch workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || workflow.workspaceId !== req.user!.workspaceId) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Create run record
    const run = await prisma.run.create({
      data: {
        workflowId,
        workspaceId: workflow.workspaceId,
        triggeredBy: req.user!.userId,
        triggerType: 'manual',
        status: 'queued',
        inputData,
      },
    });

    // Enqueue job
    await workflowQueue.add({ runId: run.id });

    res.json({ runId: run.id, status: 'queued' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get run status
router.get('/:runId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { runId } = req.params;

    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: { workflow: true },
    });

    if (!run || run.workspaceId !== req.user!.workspaceId) {
      return res.status(404).json({ error: 'Run not found' });
    }

    res.json(run);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

---

## 4️⃣ Next.js Frontend (Auth Pages)

### Install Dependencies

```bash
cd apps/frontend
npm install axios swr
```

### Login Page (`apps/frontend/src/app/auth/login/page.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('workspaceId', data.workspace.id);

      // Redirect to dashboard
      router.push(`/w/${data.workspace.id}/dashboard`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-black">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6">Login to AutomateLanka</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Login
          </button>
        </form>

        <p className="text-white/70 text-center mt-4">
          Don't have an account?{' '}
          <a href="/auth/register" className="text-purple-400 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

## 5️⃣ Next Steps

This guide covers the **core foundation**. To complete the SaaS platform, implement:

1. ✅ **Phase 1**: Auth + Workspaces (covered above)
2. 🔄 **Phase 2**: Workflow CRUD
3. 🔄 **Phase 3**: Smart Search (multi-tenant)
4. 🔄 **Phase 4**: Worker execution (covered above)
5. 🔄 **Phase 5**: Integrations
6. 🔄 **Phase 6**: Billing (Stripe)

---

**Ready to start building?** 🚀

Let me know which phase you'd like to tackle first!

