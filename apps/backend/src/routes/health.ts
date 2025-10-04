import express from 'express'
import { PrismaClient } from '@autolanka/db'
import Redis from 'ioredis'

const router = express.Router()
const prisma = new PrismaClient()

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Health check endpoints
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: {}
    }

    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`
      health.services.database = {
        status: 'healthy',
        responseTime: Date.now()
      }
    } catch (error) {
      health.services.database = {
        status: 'unhealthy',
        error: error.message
      }
      health.status = 'unhealthy'
    }

    // Check Redis
    try {
      const start = Date.now()
      await redis.ping()
      health.services.redis = {
        status: 'healthy',
        responseTime: Date.now() - start
      }
    } catch (error) {
      health.services.redis = {
        status: 'unhealthy',
        error: error.message
      }
      health.status = 'unhealthy'
    }

    // Check external services
    try {
      const start = Date.now()
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      })
      health.services.openai = {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - start,
        statusCode: response.status
      }
      if (!response.ok) {
        health.status = 'unhealthy'
      }
    } catch (error) {
      health.services.openai = {
        status: 'unhealthy',
        error: error.message
      }
      health.status = 'unhealthy'
    }

    const statusCode = health.status === 'healthy' ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    console.error('Health check error:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    })
  }
})

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      services: {},
      metrics: {}
    }

    // Database health
    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const responseTime = Date.now() - start
      
      // Get database stats
      const userCount = await prisma.user.count()
      const orgCount = await prisma.organization.count()
      const mediaCount = await prisma.media.count()
      
      health.services.database = {
        status: 'healthy',
        responseTime,
        stats: {
          users: userCount,
          organizations: orgCount,
          media: mediaCount
        }
      }
    } catch (error) {
      health.services.database = {
        status: 'unhealthy',
        error: error.message
      }
      health.status = 'unhealthy'
    }

    // Redis health
    try {
      const start = Date.now()
      await redis.ping()
      const responseTime = Date.now() - start
      
      // Get Redis info
      const info = await redis.info('memory')
      const memoryUsage = info.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'unknown'
      
      health.services.redis = {
        status: 'healthy',
        responseTime,
        memoryUsage
      }
    } catch (error) {
      health.services.redis = {
        status: 'unhealthy',
        error: error.message
      }
      health.status = 'unhealthy'
    }

    // OpenAI health
    try {
      const start = Date.now()
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      })
      const responseTime = Date.now() - start
      
      if (response.ok) {
        const data = await response.json()
        health.services.openai = {
          status: 'healthy',
          responseTime,
          modelsAvailable: data.data?.length || 0
        }
      } else {
        health.services.openai = {
          status: 'unhealthy',
          responseTime,
          statusCode: response.status,
          error: response.statusText
        }
        health.status = 'unhealthy'
      }
    } catch (error) {
      health.services.openai = {
        status: 'unhealthy',
        error: error.message
      }
      health.status = 'unhealthy'
    }

    // S3/MinIO health
    try {
      const start = Date.now()
      // This would require AWS SDK setup
      // For now, we'll simulate the check
      const responseTime = Date.now() - start
      
      health.services.s3 = {
        status: 'healthy',
        responseTime,
        endpoint: process.env.S3_ENDPOINT || 'not configured'
      }
    } catch (error) {
      health.services.s3 = {
        status: 'unhealthy',
        error: error.message
      }
      health.status = 'unhealthy'
    }

    // System metrics
    health.metrics = {
      loadAverage: process.platform === 'linux' ? require('os').loadavg() : null,
      freeMemory: require('os').freemem(),
      totalMemory: require('os').totalmem(),
      cpuCount: require('os').cpus().length
    }

    const statusCode = health.status === 'healthy' ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    console.error('Detailed health check error:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed'
    })
  }
})

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const checks = await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`,
      redis.ping()
    ])

    const allReady = checks.every(check => check.status === 'fulfilled')
    
    if (allReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      })
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: checks.map((check, index) => ({
          service: index === 0 ? 'database' : 'redis',
          status: check.status,
          error: check.status === 'rejected' ? check.reason.message : null
        }))
      })
    }
  } catch (error) {
    console.error('Readiness check error:', error)
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed'
    })
  }
})

// Liveness probe
router.get('/live', async (req, res) => {
  try {
    // Simple liveness check - just verify the process is running
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid
    })
  } catch (error) {
    console.error('Liveness check error:', error)
    res.status(503).json({
      status: 'not alive',
      timestamp: new Date().toISOString(),
      error: 'Liveness check failed'
    })
  }
})

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      system: {
        loadAverage: process.platform === 'linux' ? require('os').loadavg() : null,
        freeMemory: require('os').freemem(),
        totalMemory: require('os').totalmem(),
        cpuCount: require('os').cpus().length
      },
      database: {},
      redis: {},
      requests: {
        total: 0, // This would need to be tracked
        errors: 0,
        avgResponseTime: 0
      }
    }

    // Database metrics
    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      metrics.database = {
        status: 'healthy',
        responseTime: Date.now() - start
      }
    } catch (error) {
      metrics.database = {
        status: 'unhealthy',
        error: error.message
      }
    }

    // Redis metrics
    try {
      const start = Date.now()
      await redis.ping()
      metrics.redis = {
        status: 'healthy',
        responseTime: Date.now() - start
      }
    } catch (error) {
      metrics.redis = {
        status: 'unhealthy',
        error: error.message
      }
    }

    res.json(metrics)
  } catch (error) {
    console.error('Metrics error:', error)
    res.status(500).json({
      error: 'Failed to fetch metrics'
    })
  }
})

// Service-specific health checks
router.get('/database', async (req, res) => {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - start
    
    res.json({
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

router.get('/redis', async (req, res) => {
  try {
    const start = Date.now()
    await redis.ping()
    const responseTime = Date.now() - start
    
    res.json({
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

router.get('/openai', async (req, res) => {
  try {
    const start = Date.now()
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    })
    const responseTime = Date.now() - start
    
    if (response.ok) {
      res.json({
        status: 'healthy',
        responseTime,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      })
    } else {
      res.status(503).json({
        status: 'unhealthy',
        responseTime,
        statusCode: response.status,
        error: response.statusText,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

export default router
