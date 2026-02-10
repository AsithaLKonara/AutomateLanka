
# AutomateLanka: AI-Powered Enterprise Automation Platform

AutomateLanka is a professional, self-hosted automation hub that bridges the gap between intelligent AI discovery and high-fidelity workflow execution. Built with a premium "Glassmorphism" aesthetic, it offers a robust SaaS infrastructure for managing complex business processes at scale.

## 🚀 Key Features

### 🧠 Intelligent Search & Discovery
*   **Semantic AI Search**: Discover workflows using natural language queries powered by local embeddings (Xenova Transformers).
*   **Intelligent Intent Analysis**: Automatically extract services, triggers, and complexity levels from search queries.
*   **Workflow Recommendations**: Real-time suggestions for automation patterns based on user input.

### 🏗️ Workflow Engine (n8n-Style)
*   **Visual Canvas**: High-fidelity, drag-and-drop workflow builder with a node-based architecture.
*   **Topological Execution**: Intelligent node dependencies management ensuring sequential and parallel steps run correctly.
*   **Extensible Handlers**: Native support for HTTP Requests, Slack, Gmail, Google Sheets, Set transformations, and Conditional (IF) logic.
*   **Lifecycle Hooks**: System-wide events (`onWorkflowSuccess`, `onNodeError`, etc.) for auditing and custom side effects.

### � Business & SaaS Layer
*   **Stripe Subscriptions**: Integrated billing system with checkout sessions, customer portal, and secure webhook processing.
*   **Usage Enforcement**: Hardened middleware to manage tiered plan limits (Workflow counts, Monthly runs, Member seats).
*   **Multi-Tenancy**: Secure Workspace (Organization) isolation with RBAC-based membership management.
*   **Transactional Emails**: Automated outgoing mail for verification, password resets, and invitations via Resend.

### 🛡️ Security & Reliability
*   **Audit Logging**: Comprehensive activity tracking for every critical action within a workspace.
*   **Security Service**: Multi-layer defense against XSS, clickjacking, and intelligent rate limiting.
*   **Monitoring**: Centralized error tracking with Sentry and built-in health diagnostics.
*   **Database Persistence**: Robust schema management using Prisma ORM with SQLite (Dev) and PostgreSQL (Prod) support.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & Framer Motion (Glassmorphism UI)
- **State Management**: React Query & Lucide Icons
- **Workflow UI**: XYFlow (React Flow) Foundation

### Backend
- **Runtime**: Node.js & Express (TypeScript)
- **Queue System**: BullMQ with Redis for asynchronous execution
- **Database**: PostgreSQL with Prisma ORM
- **AI/ML**: Xenova Transformers for local semantic embeddings

### Infrastructure & DevOps
- **Monorepo**: TurboRepo for high-performance builds
- **Monitoring**: Sentry SDK integration
- **CI/CD Ready**: Dockerized environments and production-grade deployment scripts

---

## � Project Structure

```
├── apps/
│   ├── frontend/          # Premium Next.js web application
│   └── backend/           # Scalable Express/Node.js API server
├── packages/              # Shared Monorepo workspace
│   ├── db/                # Unified Prisma schema and database client
│   ├── ui/                # Shared component library
│   └── common/            # Shared types, constants, and utilities
├── scripts/               # DevOps, verification, and maintenance scripts
├── DEPLOY.sh              # Master deployment entry point
└── docker-compose.yml     # Infrastructure orchestration (Database, Redis)
```

---

## 🚦 Getting Started

### Prerequisites
*   **Node.js**: v20+
*   **Docker**: Required for Redis and Database
*   **pnpm**: Recommended for monorepo management

### Installation & Local Setup

1.  **Clone & Install**:
    ```bash
    git clone <repo-url>
    cd automatelanka
    pnpm install
    ```

2.  **Environment Setup**:
    Copy `env.example` to `.env` and fill in your Stripe, Resend, and CLerk credentials.

3.  **Start Infrastructure**:
    ```bash
    docker-compose up -d
    ```

4.  **Database Migration**:
    ```bash
    npm run db:setup
    ```

5.  **Run Development Mode**:
    ```bash
    npm run dev
    ```

---

## 📦 Deployment

### Production Checklist
Ensure the following variables are set in your production environment (Railway/Vercel):
- `DATABASE_URL`, `REDIS_URL`
- `STRIPE_SECRET_KEY`, `RESEND_API_KEY`
- `JWT_SECRET`, `ENCRYPTION_KEY` (32 chars)

### Automation Scripts
- **`./DEPLOY.sh`**: Automatic environment verification, building, and migration.
- **`scripts/setup-production-env.ts`**: Helper to generate secure production secrets.

---

## 🤝 Contributing
AutomateLanka follows professional coding standards. Please ensure all code passes `npm run lint` and `npm run test` before submitting changes.

## 📄 License
Enterprise Professional License. See LICENSE for details.