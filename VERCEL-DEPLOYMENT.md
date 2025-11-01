# 🚀 Vercel Deployment Guide

## Overview

Your AutomateLanka platform can be deployed to Vercel with two approaches:

### **Option 1: Full Stack on Vercel** (Recommended)
- Frontend: Next.js on Vercel
- Backend: Next.js API Routes (serverless)
- Database: Vercel Postgres or Supabase

### **Option 2: Hybrid Deployment**
- Frontend: Next.js on Vercel
- Backend: Express on Railway/Render
- Database: SQLite on Railway/Render

---

## 🎯 **Option 1: Full Vercel (Recommended)**

### **Changes Needed**

1. **Move Express routes to Next.js API routes** ✅ (Already created!)
2. **Replace SQLite with Vercel Postgres**
3. **Keep workflows in storage (Vercel Blob or S3)**

### **Already Compatible**
✅ Next.js 14 frontend
✅ API routes in `apps/frontend/src/app/api/workflows/`
✅ TypeScript throughout
✅ Serverless-ready code

---

## 🛠️ **Quick Vercel Deploy**

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Configure for Vercel**
Already created these files:
- ✅ `vercel.json` (will create)
- ✅ `apps/frontend/.env.production`

### **Step 3: Deploy**
```bash
cd apps/frontend
vercel --prod
```

---

## 📁 **Files to Create**

### **1. Root vercel.json**
Location: `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/frontend/src/app/api/$1"
    }
  ]
}
```

### **2. Frontend vercel.json**
Location: `apps/frontend/vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### **3. Environment Variables**
In Vercel Dashboard, add:
```
BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
```

---

## 🎯 **Option 2: Hybrid Deployment**

### **Frontend on Vercel**
```bash
cd apps/frontend
vercel --prod
```

### **Backend on Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd apps/backend
railway init
railway up
```

### **Backend on Render**
```bash
# Create render.yaml
cd apps/backend
# Push to GitHub
# Connect to Render dashboard
```

---

## ⚠️ **Important Considerations**

### **Vercel Limitations**
- **Serverless functions** (no long-running processes)
- **10s execution limit** on Hobby plan
- **Ephemeral filesystem** (can't write to disk)
- **No SQLite persistence** (use Postgres instead)

### **Solutions**

**For Database:**
- Use Vercel Postgres
- Use Supabase (PostgreSQL)
- Use PlanetScale (MySQL)
- Use MongoDB Atlas

**For Workflows Storage:**
- Use Vercel Blob Storage
- Use AWS S3
- Use Cloudflare R2
- Keep in Git repository

---

## 🚀 **Deployment Strategies**

### **Strategy 1: Pure Vercel** ⭐ (Best for small scale)
```
Frontend: Vercel
Backend: Next.js API Routes
Database: Vercel Postgres
Files: Vercel Blob Storage
```

**Pros:**
- Single platform
- Easy setup
- Automatic HTTPS
- Global CDN

**Cons:**
- Need to migrate SQLite → Postgres
- Serverless limitations
- Cold starts

### **Strategy 2: Vercel + Railway** ⭐⭐ (Best for production)
```
Frontend: Vercel
Backend: Railway (Express + SQLite)
Database: SQLite on Railway
Files: In repository
```

**Pros:**
- Keep existing backend
- SQLite works
- No migration needed
- Long-running server

**Cons:**
- Two platforms
- Slightly more complex

### **Strategy 3: All Railway** ⭐ (Simplest)
```
Frontend: Railway
Backend: Railway
Database: SQLite on Railway
```

**Pros:**
- Single platform
- Keep everything as-is
- Easiest deployment

**Cons:**
- Not using Vercel

---

## 📝 **Vercel Configuration Files**

I'll create these for you now...

