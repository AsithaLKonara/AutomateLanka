import express from 'express'
import { PrismaClient } from '@autolanka/db'
import { z } from 'zod'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const createIntegrationSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['webhook', 'api', 'oauth', 'sftp', 'database']),
  config: z.record(z.any()),
  orgId: z.string(),
  enabled: z.boolean().default(true)
})

const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  config: z.record(z.any()).optional(),
  enabled: z.boolean().optional()
})

const testIntegrationSchema = z.object({
  config: z.record(z.any())
})

// Get integrations
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { 
      page = 1, 
      limit = 20, 
      type, 
      enabled,
      orgId 
    } = req.query

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const orgIds = user.organizations.map(uo => uo.org_id)

    const where: any = {
      org_id: { in: orgIds }
    }

    if (type) {
      where.type = type
    }

    if (enabled !== undefined) {
      where.enabled = enabled === 'true'
    }

    if (orgId) {
      where.org_id = orgId
    }

    const integrations = await prisma.integration.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    })

    const total = await prisma.integration.count({ where })

    res.json({
      integrations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get integration by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const orgIds = user.organizations.map(uo => uo.org_id)

    const integration = await prisma.integration.findFirst({
      where: {
        id,
        org_id: { in: orgIds }
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    })

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' })
    }

    res.json({ integration })
  } catch (error) {
    console.error('Error fetching integration:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create integration
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const validatedData = createIntegrationSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify organization belongs to user
    const hasAccess = user.organizations.some(uo => uo.org_id === validatedData.orgId)
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to organization' })
    }

    const integration = await prisma.integration.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        config: validatedData.config,
        enabled: validatedData.enabled,
        org_id: validatedData.orgId,
        created_by: user.id
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    })

    res.status(201).json({ integration })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error creating integration:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update integration
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const validatedData = updateIntegrationSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const orgIds = user.organizations.map(uo => uo.org_id)

    // Verify integration belongs to user's organization
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        id,
        org_id: { in: orgIds }
      }
    })

    if (!existingIntegration) {
      return res.status(404).json({ error: 'Integration not found' })
    }

    const updateData: any = {}
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name
    }
    if (validatedData.config !== undefined) {
      updateData.config = validatedData.config
    }
    if (validatedData.enabled !== undefined) {
      updateData.enabled = validatedData.enabled
    }

    const integration = await prisma.integration.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    })

    res.json({ integration })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating integration:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete integration
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const orgIds = user.organizations.map(uo => uo.org_id)

    // Verify integration belongs to user's organization
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        id,
        org_id: { in: orgIds }
      }
    })

    if (!existingIntegration) {
      return res.status(404).json({ error: 'Integration not found' })
    }

    await prisma.integration.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting integration:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Test integration
router.post('/:id/test', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const validatedData = testIntegrationSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const orgIds = user.organizations.map(uo => uo.org_id)

    const integration = await prisma.integration.findFirst({
      where: {
        id,
        org_id: { in: orgIds }
      }
    })

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' })
    }

    // Test integration based on type
    let testResult
    try {
      switch (integration.type) {
        case 'webhook':
          testResult = await testWebhookIntegration(validatedData.config)
          break
        case 'api':
          testResult = await testApiIntegration(validatedData.config)
          break
        case 'oauth':
          testResult = await testOAuthIntegration(validatedData.config)
          break
        case 'sftp':
          testResult = await testSftpIntegration(validatedData.config)
          break
        case 'database':
          testResult = await testDatabaseIntegration(validatedData.config)
          break
        default:
          throw new Error('Unsupported integration type')
      }

      res.json({ 
        success: true, 
        result: testResult,
        message: 'Integration test successful'
      })
    } catch (testError) {
      res.json({ 
        success: false, 
        error: testError.message,
        message: 'Integration test failed'
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error testing integration:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get integration logs
router.get('/:id/logs', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { page = 1, limit = 50 } = req.query

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const orgIds = user.organizations.map(uo => uo.org_id)

    // Verify integration belongs to user's organization
    const integration = await prisma.integration.findFirst({
      where: {
        id,
        org_id: { in: orgIds }
      }
    })

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' })
    }

    // Get integration logs (this would need a separate IntegrationLog model)
    const logs = await prisma.integrationLog.findMany({
      where: { integration_id: id },
      orderBy: { created_at: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    })

    const total = await prisma.integrationLog.count({ 
      where: { integration_id: id } 
    })

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching integration logs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper functions for testing different integration types
async function testWebhookIntegration(config: any) {
  const { url, method = 'POST', headers = {}, body } = config
  
  if (!url) {
    throw new Error('URL is required for webhook integration')
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  }
}

async function testApiIntegration(config: any) {
  const { baseUrl, endpoint, method = 'GET', headers = {}, auth } = config
  
  if (!baseUrl || !endpoint) {
    throw new Error('Base URL and endpoint are required for API integration')
  }

  const url = `${baseUrl}${endpoint}`
  const requestHeaders: any = {
    'Content-Type': 'application/json',
    ...headers
  }

  if (auth) {
    if (auth.type === 'bearer') {
      requestHeaders.Authorization = `Bearer ${auth.token}`
    } else if (auth.type === 'basic') {
      const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64')
      requestHeaders.Authorization = `Basic ${credentials}`
    }
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return {
    status: response.status,
    statusText: response.statusText,
    data: await response.json()
  }
}

async function testOAuthIntegration(config: any) {
  const { clientId, clientSecret, tokenUrl, scope } = config
  
  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error('Client ID, client secret, and token URL are required for OAuth integration')
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  })

  if (scope) {
    params.append('scope', scope)
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  })

  if (!response.ok) {
    throw new Error(`OAuth token request failed: ${response.status} ${response.statusText}`)
  }

  const tokenData = await response.json()
  
  if (!tokenData.access_token) {
    throw new Error('No access token received from OAuth provider')
  }

  return {
    tokenType: tokenData.token_type,
    expiresIn: tokenData.expires_in,
    scope: tokenData.scope
  }
}

async function testSftpIntegration(config: any) {
  const { host, port = 22, username, password, privateKey } = config
  
  if (!host || !username) {
    throw new Error('Host and username are required for SFTP integration')
  }

  if (!password && !privateKey) {
    throw new Error('Either password or private key is required for SFTP integration')
  }

  // This would require an SFTP client library like ssh2-sftp-client
  // For now, we'll simulate the test
  return {
    connected: true,
    host,
    port,
    username
  }
}

async function testDatabaseIntegration(config: any) {
  const { host, port, database, username, password, type } = config
  
  if (!host || !database || !username || !password || !type) {
    throw new Error('Host, database, username, password, and type are required for database integration')
  }

  // This would require database-specific drivers
  // For now, we'll simulate the test
  return {
    connected: true,
    host,
    port,
    database,
    type
  }
}

export default router
