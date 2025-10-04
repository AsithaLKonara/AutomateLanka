import express from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  company: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  timezone: z.string().optional(),
  language: z.string().optional()
})

const updateNotificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  sms: z.boolean().optional(),
  workflowUpdates: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
  marketing: z.boolean().optional()
})

const updateSecuritySettingsSchema = z.object({
  twoFactor: z.boolean().optional(),
  sessionTimeout: z.number().min(0).max(1440).optional(), // max 24 hours
  loginAlerts: z.boolean().optional(),
  deviceManagement: z.boolean().optional()
})

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
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

    res.json({
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
        organizations: user.organizations
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const validatedData = updateProfileSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        updatedAt: new Date()
      },
      include: {
        profile: true
      }
    })

    // Update or create user profile with additional fields
    if (user.profile) {
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: {
          company: validatedData.company,
          phone: validatedData.phone,
          timezone: validatedData.timezone,
          language: validatedData.language,
          updatedAt: new Date()
        }
      })
    } else {
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          company: validatedData.company,
          phone: validatedData.phone,
          timezone: validatedData.timezone,
          language: validatedData.language
        }
      })
    }

    const updatedProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    })

    res.json({
      success: true,
      user: {
        ...updatedUser,
        profile: updatedProfile
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating user profile:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get notification preferences
router.get('/notification-preferences', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Default notification preferences
    const preferences = {
      email: user.profile?.emailNotifications ?? true,
      push: user.profile?.pushNotifications ?? true,
      sms: user.profile?.smsNotifications ?? false,
      workflowUpdates: user.profile?.workflowUpdates ?? true,
      systemAlerts: user.profile?.systemAlerts ?? true,
      marketing: user.profile?.marketingEmails ?? false
    }

    res.json({ preferences })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update notification preferences
router.put('/notification-preferences', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const validatedData = updateNotificationPreferencesSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update or create user profile with notification preferences
    if (user.profile) {
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: {
          emailNotifications: validatedData.email,
          pushNotifications: validatedData.push,
          smsNotifications: validatedData.sms,
          workflowUpdates: validatedData.workflowUpdates,
          systemAlerts: validatedData.systemAlerts,
          marketingEmails: validatedData.marketing,
          updatedAt: new Date()
        }
      })
    } else {
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          emailNotifications: validatedData.email ?? true,
          pushNotifications: validatedData.push ?? true,
          smsNotifications: validatedData.sms ?? false,
          workflowUpdates: validatedData.workflowUpdates ?? true,
          systemAlerts: validatedData.systemAlerts ?? true,
          marketingEmails: validatedData.marketing ?? false
        }
      })
    }

    res.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating notification preferences:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get security settings
router.get('/security-settings', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Default security settings
    const settings = {
      twoFactor: user.profile?.twoFactorEnabled ?? false,
      sessionTimeout: user.profile?.sessionTimeout ?? 30,
      loginAlerts: user.profile?.loginAlerts ?? true,
      deviceManagement: user.profile?.deviceManagement ?? true
    }

    res.json({ settings })
  } catch (error) {
    console.error('Error fetching security settings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update security settings
router.put('/security-settings', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const validatedData = updateSecuritySettingsSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Update or create user profile with security settings
    if (user.profile) {
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: {
          twoFactorEnabled: validatedData.twoFactor,
          sessionTimeout: validatedData.sessionTimeout,
          loginAlerts: validatedData.loginAlerts,
          deviceManagement: validatedData.deviceManagement,
          updatedAt: new Date()
        }
      })
    } else {
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          twoFactorEnabled: validatedData.twoFactor ?? false,
          sessionTimeout: validatedData.sessionTimeout ?? 30,
          loginAlerts: validatedData.loginAlerts ?? true,
          deviceManagement: validatedData.deviceManagement ?? true
        }
      })
    }

    res.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating security settings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
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

    // Get statistics
    const [totalMedia, totalPosts, activeWorkflows, scheduledPosts] = await Promise.all([
      prisma.media.count({
        where: { org_id: { in: orgIds } }
      }),
      prisma.scheduledPost.count({
        where: { 
          org_id: { in: orgIds },
          status: 'published'
        }
      }),
      prisma.workflowExecution.count({
        where: { 
          org_id: { in: orgIds },
          status: 'running'
        }
      }),
      prisma.scheduledPost.count({
        where: { 
          org_id: { in: orgIds },
          status: 'scheduled'
        }
      })
    ])

    res.json({
      stats: {
        totalMedia,
        totalPosts,
        activeWorkflows,
        scheduledPosts
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { limit = 10 } = req.query

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
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

    // Get recent activity from various sources
    const [recentMedia, recentPosts, recentWorkflows] = await Promise.all([
      prisma.media.findMany({
        where: { org_id: { in: orgIds } },
        orderBy: { created_at: 'desc' },
        take: Math.floor(Number(limit) / 3),
        select: {
          id: true,
          title: true,
          type: true,
          created_at: true,
          status: true
        }
      }),
      prisma.scheduledPost.findMany({
        where: { org_id: { in: orgIds } },
        orderBy: { created_at: 'desc' },
        take: Math.floor(Number(limit) / 3),
        select: {
          id: true,
          title: true,
          platform: true,
          created_at: true,
          status: true
        }
      }),
      prisma.workflowExecution.findMany({
        where: { org_id: { in: orgIds } },
        orderBy: { created_at: 'desc' },
        take: Math.floor(Number(limit) / 3),
        select: {
          id: true,
          template_id: true,
          created_at: true,
          status: true
        }
      })
    ])

    // Combine and format activity
    const activity = [
      ...recentMedia.map(item => ({
        id: `media-${item.id}`,
        type: 'media',
        title: `New ${item.type} uploaded: ${item.title}`,
        timestamp: item.created_at,
        status: item.status
      })),
      ...recentPosts.map(item => ({
        id: `post-${item.id}`,
        type: 'post',
        title: `${item.platform} post scheduled: ${item.title}`,
        timestamp: item.created_at,
        status: item.status
      })),
      ...recentWorkflows.map(item => ({
        id: `workflow-${item.id}`,
        type: 'workflow',
        title: `Workflow executed: ${item.template_id}`,
        timestamp: item.created_at,
        status: item.status
      }))
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, Number(limit))

    res.json({ activity })
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
