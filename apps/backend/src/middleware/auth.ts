import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'

// Note: This middleware uses a different user type than authMiddleware
// It's kept for backward compatibility but should be migrated to use authMiddleware
// Using a local interface to avoid conflicts with authMiddleware's global augmentation
interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
}

type AuthRequest = Request & {
  user?: AuthUser
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      // Decode and verify JWT token
      const { authService } = await import('../services/authService');
      const payload = authService.verifyToken(token);
      
      // Find user in database using JWT payload
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })

      if (!user) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'User not found' 
        })
      }

      // Add user to request (cast to avoid conflict with authMiddleware's global type)
      ;(req as any).user = user
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
export const optionalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      const { authService } = await import('../services/authService');
      const payload = authService.verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
      
        if (user) {
          ;(req as any).user = user
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
export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      })
    }

    // Check if user is admin (role check) or has admin membership
    if (req.user.role !== 'admin') {
      // Also check if user is owner/admin of any workspace
      const membership = await prisma.membership.findFirst({
        where: {
          userId: req.user.id,
          role: { in: ['owner', 'admin'] }
        }
      })

      if (!membership) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Admin access required' 
        })
      }
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
export const orgMemberMiddleware = async (req: AuthRequestWithOrg, res: Response, next: NextFunction) => {
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

    // Check if user is member of the workspace (using workspaceId as orgId)
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        workspaceId: orgId as string
      }
    })

    if (!membership) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Workspace access required' 
      })
    }

    // Add membership info to request
    req.organization = {
      id: membership.id,
      userId: membership.userId,
      orgId: membership.workspaceId,
      role: membership.role
    }
    next()
    
  } catch (error) {
    console.error('Organization member middleware error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authorization failed' 
    })
  }
}

// Extend AuthRequest interface to include organization
interface AuthRequestWithOrg extends AuthRequest {
  organization?: {
    id: string
    userId: string
    orgId: string
    role: string
  }
}


