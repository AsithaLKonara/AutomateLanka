import express from 'express'
import { PrismaClient } from '@autolanka/db'
import { z } from 'zod'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const createNotificationSchema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  type: z.enum(['info', 'success', 'warning', 'error']),
  userId: z.string().optional(),
  orgId: z.string().optional(),
  data: z.record(z.any()).optional()
})

const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional()
})

const markAllReadSchema = z.object({
  userId: z.string().optional(),
  orgId: z.string().optional()
})

// Get user notifications
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
      read, 
      archived = false 
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
      archived: archived === 'true',
      OR: [
        { user_id: user.id },
        { org_id: { in: orgIds } }
      ]
    }

    if (type) {
      where.type = type
    }

    if (read !== undefined) {
      where.read = read === 'true'
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    const total = await prisma.notification.count({ where })

    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get notification by ID
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

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        OR: [
          { user_id: user.id },
          { org_id: { in: orgIds } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    // Mark as read if not already read
    if (!notification.read) {
      await prisma.notification.update({
        where: { id },
        data: { read: true, read_at: new Date() }
      })
      notification.read = true
      notification.read_at = new Date()
    }

    res.json({ notification })
  } catch (error) {
    console.error('Error fetching notification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create notification
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const validatedData = createNotificationSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify target user exists if specified
    let targetUser = null
    if (validatedData.userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: validatedData.userId }
      })
      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' })
      }
    }

    // Verify organization exists if specified
    let organization = null
    if (validatedData.orgId) {
      organization = await prisma.organization.findUnique({
        where: { id: validatedData.orgId }
      })
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' })
      }
    }

    const notification = await prisma.notification.create({
      data: {
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        user_id: validatedData.userId || user.id,
        org_id: validatedData.orgId || null,
        data: validatedData.data || {},
        created_by: user.id
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    res.status(201).json({ notification })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error creating notification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update notification
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const validatedData = updateNotificationSchema.parse(req.body)

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

    // Verify notification belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id,
        OR: [
          { user_id: user.id },
          { org_id: { in: orgIds } }
        ]
      }
    })

    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    const updateData: any = {}
    if (validatedData.read !== undefined) {
      updateData.read = validatedData.read
      if (validatedData.read) {
        updateData.read_at = new Date()
      }
    }
    if (validatedData.archived !== undefined) {
      updateData.archived = validatedData.archived
      if (validatedData.archived) {
        updateData.archived_at = new Date()
      }
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    res.json({ notification })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating notification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete notification
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

    // Verify notification belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id,
        OR: [
          { user_id: user.id },
          { org_id: { in: orgIds } }
        ]
      }
    })

    if (!existingNotification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    await prisma.notification.delete({
      where: { id }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Mark all notifications as read
router.post('/mark-all-read', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const validatedData = markAllReadSchema.parse(req.body)

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
      read: false,
      archived: false,
      OR: [
        { user_id: user.id },
        { org_id: { in: orgIds } }
      ]
    }

    if (validatedData.userId) {
      where.user_id = validatedData.userId
    }

    if (validatedData.orgId) {
      where.org_id = validatedData.orgId
    }

    const result = await prisma.notification.updateMany({
      where,
      data: {
        read: true,
        read_at: new Date()
      }
    })

    res.json({ 
      success: true, 
      updatedCount: result.count 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error marking notifications as read:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get notification statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

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

    const where = {
      archived: false,
      OR: [
        { user_id: user.id },
        { org_id: { in: orgIds } }
      ]
    }

    const [total, unread, byType] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { ...where, read: false } 
      }),
      prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: {
          type: true
        }
      })
    ])

    const stats = {
      total,
      unread,
      read: total - unread,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type
        return acc
      }, {} as Record<string, number>)
    }

    res.json({ stats })
  } catch (error) {
    console.error('Error fetching notification stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Bulk operations
router.post('/bulk', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { action, notificationIds } = req.body

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ error: 'Notification IDs array is required' })
    }

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

    // Verify all notifications belong to user
    const notifications = await prisma.notification.findMany({
      where: {
        id: { in: notificationIds },
        OR: [
          { user_id: user.id },
          { org_id: { in: orgIds } }
        ]
      }
    })

    if (notifications.length !== notificationIds.length) {
      return res.status(403).json({ error: 'Some notifications do not belong to user' })
    }

    let result
    const updateData: any = {}

    switch (action) {
      case 'mark-read':
        updateData.read = true
        updateData.read_at = new Date()
        result = await prisma.notification.updateMany({
          where: { id: { in: notificationIds } },
          data: updateData
        })
        break

      case 'mark-unread':
        updateData.read = false
        updateData.read_at = null
        result = await prisma.notification.updateMany({
          where: { id: { in: notificationIds } },
          data: updateData
        })
        break

      case 'archive':
        updateData.archived = true
        updateData.archived_at = new Date()
        result = await prisma.notification.updateMany({
          where: { id: { in: notificationIds } },
          data: updateData
        })
        break

      case 'unarchive':
        updateData.archived = false
        updateData.archived_at = null
        result = await prisma.notification.updateMany({
          where: { id: { in: notificationIds } },
          data: updateData
        })
        break

      case 'delete':
        result = await prisma.notification.deleteMany({
          where: { id: { in: notificationIds } }
        })
        break

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }

    res.json({ 
      success: true, 
      updatedCount: result.count || result.count 
    })
  } catch (error) {
    console.error('Error performing bulk operation:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
