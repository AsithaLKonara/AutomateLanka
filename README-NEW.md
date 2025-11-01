# 🚀 AutomateLanka - Automation Intelligence Hub

## ✨ **Modern N8N Workflows Platform**

A comprehensive, **tech-inspired** automation platform with **AI-powered search** and stunning modern UI.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![Fast](https://img.shields.io/badge/Search-<50ms-brightgreen.svg)]()

---

## 🎯 **Quick Start**

### **1. Start Backend**
```bash
cd apps/backend
npm run dev
# Server: http://localhost:8000
```

### **2. Start Frontend**
```bash
cd apps/frontend
npm run dev
# App: http://localhost:3000
```

### **3. Open Browser**
```
http://localhost:3000
```

---

## ✨ **Features**

### **🧠 AI-Powered Search**
- Natural language queries
- Intent detection
- Smart suggestions
- Match scoring
- **No heavy AI** - lightweight & fast!

### **📦 2,057+ Workflows**
- Production-ready automations
- 326 integrations
- 76,618 nodes
- Instant download

### **🎨 Modern UI/UX**
- Tech-inspired design
- Glassmorphism effects
- Smooth animations
- Gradient themes
- Responsive layout

### **⚡ Lightning Fast**
- Sub-50ms searches
- 60 FPS animations
- Optimized rendering
- Local processing

---

## 📊 **Statistics**

```
📦 2,057 total workflows
✅ 2,048 active (99.6%)
🔗 76,618 total nodes
⚙️  326 integrations
```

---

## 🎨 **Pages**

| Page | URL | Description |
|------|-----|-------------|
| **Homepage** | `/` | Animated hero, stats, features |
| **AI Search** | `/ai-search` | Smart natural language search |
| **Workflows** | `/n8n-workflows` | Browse & download workflows |
| **Dashboard** | `/dashboard` | Analytics and insights |

---

## 🔧 **API Endpoints**

```bash
# Workflows
GET  /api/workflows              # Search workflows
GET  /api/workflows/stats        # Get statistics
GET  /api/workflows/:filename    # Get details
GET  /api/workflows/:filename/download

# Smart Search
POST /api/ai-search/semantic     # Smart search
GET  /api/ai-search/suggestions  # Get suggestions
POST /api/ai-search/analyze      # Analyze query
GET  /api/ai-search/similar/:id  # Find similar
POST /api/ai-search/recommend    # Recommendations
POST /api/ai-search/describe     # Describe & find
```

---

## 🎯 **Try It**

### **Search Example**
```bash
curl -X POST http://localhost:8000/api/ai-search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "send slack notification when form submitted", "limit": 5}'
```

### **Browse Example**
```bash
curl "http://localhost:8000/api/workflows?trigger=webhook&complexity=low&per_page=10"
```

---

## 📚 **Documentation**

- **START-HERE.md** - Complete setup guide
- **QUICKSTART-NODEJS.md** - 3-step quickstart
- **SMART-SEARCH-GUIDE.md** - Search usage
- **UI-UX-UPGRADE-GUIDE.md** - Design system
- **🎉-COMPLETE-SUCCESS.md** - Success summary

---

## 🚀 **Tech Stack**

**Backend:**
- Node.js 20+ with TypeScript
- Express.js
- SQLite (better-sqlite3)
- FTS5 full-text search

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

**Design:**
- Glassmorphism
- Gradient animations
- Tech-inspired aesthetics
- Responsive layouts

---

## 🎨 **Screenshots**

Visit the live app to see:
- ✨ Animated gradient backgrounds
- 🌈 Floating color orbs
- 💫 Smooth hover effects
- 📊 Interactive charts
- 🎭 Beautiful cards
- ⚡ Lightning-fast search

---

## 📞 **Links**

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **AI Search:** http://localhost:3000/ai-search
- **Workflows:** http://localhost:3000/n8n-workflows

---

## 🎉 **Built With**

❤️ Node.js + Next.js + TypeScript
✨ Modern Web Design Principles
🧠 Smart Local Algorithms
⚡ Performance Optimization
🎨 Tech-Inspired Aesthetics

---

**🚀 Start exploring your automation hub!**
