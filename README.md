
# AutomateLanka: AI-Powered Automation Platform

AutomateLanka is an enterprise-grade, self-hosted automation platform that combines the power of n8n with an intelligent AI search layer and a modern, premium UI.

## 🚀 Features

*   **AI-Powered Search**: Semantic search implementation to find potential workflows.
*   **Modern UI/UX**: Glassmorphism design, 3D animations, and a responsive layout.
*   **Enterprise Architecture**:
    *   **Backend**: Node.js/Express with TypeScript.
    *   **Frontend**: Next.js 15 with Tailwind CSS.
    *   **Database**: PostgreSQL with Prisma ORM.
    *   **Queue**: Redis + BullMQ for workflow execution.
*   **Production Ready**: Includes billing (Stripe), authentication (JWT/OAuth), and audit logging.

---

## 🛠️ Getting Started

### Prerequisites

*   Node.js (v18+)
*   Docker (for local database/redis)
*   pnpm (recommended) or npm

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd automatelanka
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy the example environment file:
    ```bash
    cp env.example .env
    ```
    *Update `.env` with your local credentials (database, stripe keys, etc.).*

4.  **Database Setup**:
    Start the local infrastructure using Docker:
    ```bash
    docker-compose up -d
    ```
    Run migrations:
    ```bash
    npm run db:setup
    ```

5.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    *   Frontend: `http://localhost:3000`
    *   Backend: `http://localhost:8000`

---

## 📦 Deployment

### Production Checklist

Before deploying, ensure you have configured the following secrets in your production environment (Railway/Vercel):

*   **Database**: `DATABASE_URL` (PostgreSQL), `REDIS_URL`
*   **Security**: `JWT_SECRET`, `REFRESH_SECRET`, `ENCRYPTION_KEY` (32 chars)
*   **Payments**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
*   **Email**: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`

### Deployment Tools

We provide utility scripts to streamline the deployment process:

*   **`DEPLOY.sh`**: The master deployment script. It verifies environment variables, runs database migrations, and builds all applications.
    ```bash
    ./DEPLOY.sh
    ```

*   **`scripts/setup-production-env.ts`**: Generates secure production secrets (JWT, Encryption keys) and creates `.env.production` files.
    ```bash
    npx tsx scripts/setup-production-env.ts
    ```

*   **`scripts/verify-db-connection.ts`**: specific check for verifying database connectivity before running heavy migrations.

### Manual Deployment Guide

#### 1. Backend (Railway/VPS)
1.  Connect your repo.
2.  Set start command: `npm start` (ensure it runs `node dist/main.js`).
3.  Set all environment variables defined in `env.example`.

#### 2. Frontend (Vercel)
1.  Import the `apps/frontend` directory.
2.  Set framework preset to **Next.js**.
3.  Add environment variables:
    *   `NEXT_PUBLIC_BACKEND_URL`: URL of your deployed backend.
    *   `NEXT_PUBLIC_STRIPE_KEY`: Your Stripe publishable key.

---

## 📂 Project Structure

```
├── apps/
│   ├── frontend/          # Next.js web application
│   └── backend/           # Express/Node.js API server
├── packages/              # Shared libraries
│   ├── db/                # Prisma schema and client
│   └── common/            # Shared types and utilities
├── scripts/               # DevOps and maintenance scripts
├── DEPLOY.sh              # Master deployment entry point
└── docker-compose.yml     # Local development infrastructure
```

## 🤝 Contributing

Please ensure all changes are verified with `npm run build` and follow the existing coding standards.

## 📄 License

Professional License. See LICENSE file for details.