import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load demo environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Demo mode middleware
app.use((req, res, next) => {
  req.demoMode = true;
  next();
});

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      demoMode?: boolean;
      user?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Autolanka Backend API is running in demo mode',
    version: '1.0.0-demo',
    timestamp: new Date().toISOString(),
    demoMode: true
  });
});

// Demo authentication middleware (bypasses real auth)
const demoAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Set demo user data
  req.user = {
    id: 'demo-user-123',
    email: 'demo@autolanka.com',
    firstName: 'Demo',
    lastName: 'User'
  };
  next();
};

// User routes (demo mode)
app.get('/api/users/profile', demoAuthMiddleware, async (req, res) => {
  try {
    res.json({
      id: req.user!.id,
      firstName: req.user!.firstName,
      lastName: req.user!.lastName,
      email: req.user!.email,
      company: 'Demo Company',
      phone: '+1-555-0123',
      timezone: 'UTC',
      language: 'en',
      notificationPreferences: {
        email: true,
        push: true,
        sms: false,
        workflowUpdates: true,
        systemAlerts: true,
        marketing: false
      },
      securitySettings: {
        twoFactor: false,
        sessionTimeout: 30,
        loginAlerts: true,
        deviceManagement: true
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/profile', demoAuthMiddleware, (req, res) => {
  console.log('Demo profile update:', req.body);
  res.json({ message: 'Profile updated successfully (demo mode)' });
});

app.put('/api/users/notification-preferences', demoAuthMiddleware, (req, res) => {
  console.log('Demo notification preferences update:', req.body);
  res.json({ message: 'Notification preferences updated successfully (demo mode)' });
});

app.put('/api/users/security-settings', demoAuthMiddleware, (req, res) => {
  console.log('Demo security settings update:', req.body);
  res.json({ message: 'Security settings updated successfully (demo mode)' });
});

app.get('/api/users/dashboard-stats', demoAuthMiddleware, (req, res) => {
  res.json({
    stats: {
      totalMedia: 42,
      totalPosts: 18,
      activeWorkflows: 5,
      scheduledPosts: 12
    }
  });
});

app.get('/api/users/recent-activity', demoAuthMiddleware, (req, res) => {
  const limit = parseInt(req.query.limit as string || '10');
  
  const mockActivity = [
    {
      id: 1,
      type: 'media',
      title: 'New video uploaded: Product Demo',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'completed'
    },
    {
      id: 2,
      type: 'workflow',
      title: 'Social media automation executed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'completed'
    },
    {
      id: 3,
      type: 'post',
      title: 'Instagram post scheduled: New Product Launch',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      status: 'scheduled'
    },
    {
      id: 4,
      type: 'content',
      title: 'AI content generated for LinkedIn',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      status: 'completed'
    },
    {
      id: 5,
      type: 'analytics',
      title: 'Weekly performance report generated',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'completed'
    }
  ];

  res.json({ activity: mockActivity.slice(0, limit) });
});

// Media routes (demo mode)
app.get('/api/media', demoAuthMiddleware, (req, res) => {
  const mockMedia = [
    {
      id: '1',
      title: 'Product Demo Video',
      type: 'video',
      url: 'https://example.com/demo-video.mp4',
      thumbnail: 'https://example.com/thumb1.jpg',
      duration: 120,
      size: 15728640,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'processed'
    },
    {
      id: '2',
      title: 'Company Podcast Episode 1',
      type: 'audio',
      url: 'https://example.com/podcast-ep1.mp3',
      thumbnail: null,
      duration: 1800,
      size: 25165824,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      status: 'processed'
    }
  ];

  res.json({ media: mockMedia });
});

app.post('/api/media/upload', demoAuthMiddleware, (req, res) => {
  console.log('Demo media upload:', req.body);
  res.json({
    id: 'demo-media-' + Date.now(),
    message: 'Media uploaded successfully (demo mode)',
    status: 'processing'
  });
});

// Content routes (demo mode)
app.get('/api/content', demoAuthMiddleware, (req, res) => {
  const mockContent = [
    {
      id: '1',
      title: 'New Product Launch Post',
      content: '🚀 Exciting news! We\'re launching our new AI-powered automation platform!',
      platform: 'instagram',
      status: 'published',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 10)
    },
    {
      id: '2',
      title: 'Weekly Update',
      content: 'Here\'s what we accomplished this week...',
      platform: 'linkedin',
      status: 'draft',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
    }
  ];

  res.json({ content: mockContent });
});

app.post('/api/content/generate', demoAuthMiddleware, async (req, res) => {
  console.log('Demo content generation request:', req.body);
  
  // Simulate ML service call
  try {
    const mlResponse = await fetch('http://localhost:8001/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: req.body.topic || 'Demo Content',
        platform: req.body.platform || 'instagram',
        brand_voice: req.body.brand_voice || 'professional'
      })
    });

    if (mlResponse.ok) {
      const mlData = await mlResponse.json();
      res.json({
        id: 'demo-content-' + Date.now(),
        ...mlData,
        status: 'generated'
      });
    } else {
      throw new Error('ML service unavailable');
    }
  } catch (error) {
    // Fallback demo content
    res.json({
      id: 'demo-content-' + Date.now(),
      content: `Demo content for: ${req.body.topic || 'Default Topic'}`,
      hashtags: ['#Demo', '#Content', '#AI'],
      platform: req.body.platform || 'instagram',
      word_count: 25,
      status: 'generated'
    });
  }
});

// Analytics routes (demo mode)
app.get('/api/analytics/overview', demoAuthMiddleware, (req, res) => {
  res.json({
    totalViews: 12543,
    totalEngagement: 2847,
    totalPosts: 18,
    averageEngagement: 15.2,
    topPerformingPlatform: 'instagram',
    growthRate: 23.5,
    period: 'last_30_days'
  });
});

// Workflow routes (demo mode)
app.get('/api/workflows', demoAuthMiddleware, (req, res) => {
  const mockWorkflows = [
    {
      id: '1',
      name: 'Social Media Automation',
      status: 'running',
      lastRun: new Date(Date.now() - 1000 * 60 * 30),
      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 2),
      executions: 45,
      successRate: 95.5
    },
    {
      id: '2',
      name: 'Content Generation',
      status: 'paused',
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 4),
      nextRun: null,
      executions: 12,
      successRate: 100
    }
  ];

  res.json({ workflows: mockWorkflows });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    demoMode: true
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    demoMode: true
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Autolanka Backend API running in DEMO mode on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎯 Demo mode: No external API keys required`);
});

export default app;
