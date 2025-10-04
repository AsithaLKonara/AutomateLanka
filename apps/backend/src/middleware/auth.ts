import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@autolanka/db'

const prisma = new PrismaClient()

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        clerkId: string
        email: string
        firstName?: string
        lastName?: string
        imageUrl?: string
      }
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header' 
      })
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Missing token' 
      })
    }

    // In a real implementation, you would verify the JWT token here
    // For now, we'll use a simple approach with Clerk's token verification
    // This is a placeholder - you should implement proper JWT verification
    
    // For development, we'll extract user info from the token
    // In production, you should verify the token with Clerk's API
    try {
      // Decode JWT token (this is a simplified approach)
      // In production, use Clerk's verifyToken function
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      
      if (!decoded.sub) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid token' 
        })
      }

      // Find user in database
      const user = await prisma.user.findUnique({
        where: { clerkId: decoded.sub },
        select: {
          id: true,
          clerkId: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true
        }
      })

      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'User not found' 
        })
      }

      // Add user to request
      req.user = user
      next()
      
    } catch (error) {
      console.error('Token verification error:', error)
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid token' 
      })
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication failed' 
    })
  }
}

// Optional auth middleware for routes that work with or without auth
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth provided, continue without user
      next()
      return
    }

    // Try to authenticate, but don't fail if it doesn't work
    try {
      const token = authHeader.substring(7)
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      
      if (decoded.sub) {
        const user = await prisma.user.findUnique({
          where: { clerkId: decoded.sub },
          select: {
            id: true,
            clerkId: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        })
        
        if (user) {
          req.user = user
        }
      }
    } catch (error) {
      // Ignore auth errors for optional auth
      console.log('Optional auth failed:', error)
    }
    
    next()
    
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    next() // Continue even if there's an error
  }
}

// Admin-only middleware
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      })
    }

    // Check if user is admin in any organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: req.user.id,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    })

    if (!userOrg) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin access required' 
      })
    }

    next()
    
  } catch (error) {
    console.error('Admin middleware error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authorization failed' 
    })
  }
}

// Organization member middleware
export const orgMemberMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      })
    }

    const orgId = req.params.orgId || req.body.orgId || req.query.orgId
    
    if (!orgId) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Organization ID required' 
      })
    }

    // Check if user is member of the organization
    const userOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: req.user.id,
        orgId: orgId as string
      }
    })

    if (!userOrg) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Organization access required' 
      })
    }

    // Add organization info to request
    req.organization = userOrg
    next()
    
  } catch (error) {
    console.error('Organization member middleware error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authorization failed' 
    })
  }
}

// Extend Request interface to include organization
declare global {
  namespace Express {
    interface Request {
      organization?: {
        id: string
        userId: string
        orgId: string
        role: string
      }
    }
  }
}
