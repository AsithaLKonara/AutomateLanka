/**
 * Standalone Workflows API Server
 * For demonstrating the Node.js migration
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { resolve, join } from 'path';
import workflowRoutes from './routes/workflows';
import aiSearchRoutes from './routes/aiSearch';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from project root
const projectRoot = resolve(process.cwd(), '../..');
const staticPath = join(projectRoot, 'static');
app.use('/static', express.static(staticPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'N8N Workflow API is running',
    features: ['workflows', 'ai-search', 'semantic-search'],
    timestamp: new Date().toISOString()
  });
});

// Workflow routes
app.use('/api/workflows', workflowRoutes);

// AI Search routes
app.use('/api/ai-search', aiSearchRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found` 
  });
});

// Start server
app.listen(PORT, HOST as string, () => {
  console.log('🚀 N8N Workflows API Server');
  console.log('=' .repeat(50));
  console.log(`🌐 Server: http://${HOST}:${PORT}`);
  console.log(`📊 Health: http://${HOST}:${PORT}/health`);
  console.log(`🔍 API: http://${HOST}:${PORT}/api/workflows`);
  console.log(`📈 Stats: http://${HOST}:${PORT}/api/workflows/stats`);
  console.log('=' .repeat(50));
});

export default app;

