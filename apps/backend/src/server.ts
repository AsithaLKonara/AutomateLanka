import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { config } from 'dotenv'
import { PrismaClient } from '@autolanka/db'

// Load environment variables
config()

// Import routes
import authRoutes from './routes/auth'
import onboardingRoutes from './routes/onboarding'
import userRoutes from './routes/users'
import organizationRoutes from './routes/organizations'
import mediaRoutes from './routes/media'
import transcriptRoutes from './routes/transcripts'
import contentRoutes from './routes/content'
import socialMediaRoutes from './routes/socialMedia'
import analyticsRoutes from './routes/analytics'
import marketplaceRoutes from './routes/marketplace'
import communityRoutes from './routes/community'
import monitoringRoutes from './routes/monitoring'
import webhookRoutes from './routes/webhooks'
import billingRoutes from './routes/billing'
import notificationRoutes from './routes/notifications'
import integrationRoutes from './routes/integrations'
import healthRoutes from './routes/health'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { authMiddleware } from './middleware/auth'
import { securityService } from './services/securityService'
import { rateLimitService } from './services/rateLimitService'

const app = express()
const server = createServer(app)
const prisma = new PrismaClient()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(securityService.securityMiddleware())
app.use(requestLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API Routes
app.use('/api/auth', rateLimitService.createMiddleware('auth'), authRoutes)
app.use('/api/onboarding', authMiddleware, onboardingRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/organizations', authMiddleware, organizationRoutes)
app.use('/api/media', rateLimitService.createMiddleware('upload'), authMiddleware, mediaRoutes)
app.use('/api/transcripts', authMiddleware, transcriptRoutes)
app.use('/api/content', authMiddleware, contentRoutes)
app.use('/api/social-media', rateLimitService.createMiddleware('social_media'), authMiddleware, socialMediaRoutes)
app.use('/api/analytics', rateLimitService.createMiddleware('analytics'), authMiddleware, analyticsRoutes)
app.use('/api/marketplace', rateLimitService.createMiddleware('marketplace'), authMiddleware, marketplaceRoutes)
app.use('/api/community', rateLimitService.createMiddleware('community'), authMiddleware, communityRoutes)
app.use('/api/monitoring', authMiddleware, monitoringRoutes)
app.use('/api/webhooks', authMiddleware, webhookRoutes)
app.use('/api/billing', authMiddleware, billingRoutes)
app.use('/api/notifications', authMiddleware, notificationRoutes)
app.use('/api/integrations', authMiddleware, integrationRoutes)
app.use('/api/health', healthRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found` 
  })
})

// Error handler
app.use(errorHandler)

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`)
  
  server.close(async () => {
    console.log('📡 HTTP server closed')
    
    try {
      await prisma.$disconnect()
      console.log('🗄️ Database connection closed')
      process.exit(0)
    } catch (error) {
      console.error('❌ Error during shutdown:', error)
      process.exit(1)
    }
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Start server
const PORT = process.env.PORT || 8000
const HOST = process.env.HOST || '0.0.0.0'

server.listen(PORT, HOST, () => {
  console.log('🚀 Autolanka Backend Server')
  console.log('=' .repeat(50))
  console.log(`🌐 Server running at http://${HOST}:${PORT}`)
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`)
  console.log(`🔍 API Documentation: http://${HOST}:${PORT}/api`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log('=' .repeat(50))
})

export default app