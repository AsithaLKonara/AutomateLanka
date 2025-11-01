import { Router, Response } from 'express';
import { workspaceService, CreateWorkspaceInput, UpdateWorkspaceInput, InviteMemberInput } from '../services/workspaceService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();

// All workspace routes require authentication
router.use(authMiddleware);

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  planId: z.string().uuid().optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(2).optional(),
  planId: z.string().uuid().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: 'Role must be either admin or member' }),
  }),
});

const updateRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'member']),
});

/**
 * GET /api/workspaces
 * List user's workspaces
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const workspaces = await workspaceService.listUserWorkspaces(req.user.userId);

    res.status(200).json({
      success: true,
      data: workspaces,
      count: workspaces.length,
    });
  } catch (error: any) {
    console.error('List workspaces error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to list workspaces',
    });
  }
});

/**
 * POST /api/workspaces
 * Create new workspace
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Validate input
    const validation = createWorkspaceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid input data',
        details: validation.error.errors,
      });
    }

    const input: CreateWorkspaceInput = {
      ...validation.data,
      ownerId: req.user.userId,
    };

    const workspace = await workspaceService.createWorkspace(input);

    res.status(201).json({
      success: true,
      data: workspace,
      message: 'Workspace created successfully',
    });
  } catch (error: any) {
    console.error('Create workspace error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to create workspace',
    });
  }
});

/**
 * GET /api/workspaces/:id
 * Get workspace details
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const workspace = await workspaceService.getWorkspace(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error: any) {
    console.error('Get workspace error:', error);

    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Workspace not found',
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to get workspace',
    });
  }
});

/**
 * PUT /api/workspaces/:id
 * Update workspace
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Validate input
    const validation = updateWorkspaceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid input data',
        details: validation.error.errors,
      });
    }

    const workspace = await workspaceService.updateWorkspace(
      req.params.id,
      req.user.userId,
      validation.data
    );

    res.status(200).json({
      success: true,
      data: workspace,
      message: 'Workspace updated successfully',
    });
  } catch (error: any) {
    console.error('Update workspace error:', error);

    if (error.message.includes('Access denied') || error.message.includes('requires')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to update workspace',
    });
  }
});

/**
 * DELETE /api/workspaces/:id
 * Delete workspace (owner only)
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    await workspaceService.deleteWorkspace(req.params.id, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete workspace error:', error);

    if (error.message.includes('Access denied') || error.message.includes('requires')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only workspace owner can delete the workspace',
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to delete workspace',
    });
  }
});

/**
 * POST /api/workspaces/:id/invite
 * Invite member to workspace
 */
router.post('/:id/invite', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Validate input
    const validation = inviteMemberSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid input data',
        details: validation.error.errors,
      });
    }

    const input: InviteMemberInput = {
      workspaceId: req.params.id,
      email: validation.data.email,
      role: validation.data.role,
      invitedBy: req.user.userId,
    };

    const membership = await workspaceService.inviteMember(input);

    res.status(201).json({
      success: true,
      data: membership,
      message: 'Member invited successfully',
    });
  } catch (error: any) {
    console.error('Invite member error:', error);

    if (error.message.includes('does not exist')) {
      return res.status(404).json({
        error: 'UserNotFound',
        message: error.message,
      });
    }

    if (error.message.includes('already a member') || error.message.includes('pending')) {
      return res.status(409).json({
        error: 'AlreadyMember',
        message: error.message,
      });
    }

    if (error.message.includes('maximum') || error.message.includes('limit')) {
      return res.status(403).json({
        error: 'PlanLimitReached',
        message: error.message,
      });
    }

    if (error.message.includes('Access denied') || error.message.includes('requires')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to invite member',
    });
  }
});

/**
 * POST /api/workspaces/:id/accept
 * Accept workspace invitation
 */
router.post('/:id/accept', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const result = await workspaceService.acceptInvitation(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Invitation accepted successfully',
    });
  } catch (error: any) {
    console.error('Accept invitation error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Invitation not found',
      });
    }

    if (error.message.includes('already accepted')) {
      return res.status(409).json({
        error: 'AlreadyAccepted',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to accept invitation',
    });
  }
});

/**
 * GET /api/workspaces/:id/members
 * List workspace members
 */
router.get('/:id/members', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const members = await workspaceService.listMembers(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: members,
      count: members.length,
    });
  } catch (error: any) {
    console.error('List members error:', error);

    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to list members',
    });
  }
});

/**
 * PUT /api/workspaces/:id/members/:userId
 * Update member role
 */
router.put('/:id/members/:userId', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Validate input
    const validation = updateRoleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid role',
        details: validation.error.errors,
      });
    }

    const result = await workspaceService.updateMemberRole(
      req.params.id,
      req.params.userId,
      validation.data.role,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Member role updated successfully',
    });
  } catch (error: any) {
    console.error('Update member role error:', error);

    if (error.message.includes('Cannot change') || error.message.includes('requires')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to update member role',
    });
  }
});

/**
 * DELETE /api/workspaces/:id/members/:userId
 * Remove member from workspace
 */
router.delete('/:id/members/:userId', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    await workspaceService.removeMember(
      req.params.id,
      req.params.userId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error: any) {
    console.error('Remove member error:', error);

    if (error.message.includes('Cannot remove') || error.message.includes('cannot remove')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to remove member',
    });
  }
});

/**
 * POST /api/workspaces/:id/transfer-ownership
 * Transfer workspace ownership
 */
router.post('/:id/transfer-ownership', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'newOwnerId is required',
      });
    }

    await workspaceService.transferOwnership(
      req.params.id,
      newOwnerId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: 'Ownership transferred successfully',
    });
  } catch (error: any) {
    console.error('Transfer ownership error:', error);

    if (error.message.includes('must be an active member')) {
      return res.status(400).json({
        error: 'InvalidTarget',
        message: error.message,
      });
    }

    if (error.message.includes('Access denied') || error.message.includes('requires')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only workspace owner can transfer ownership',
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to transfer ownership',
    });
  }
});

/**
 * POST /api/workspaces/:id/leave
 * Leave workspace
 */
router.post('/:id/leave', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    await workspaceService.leaveWorkspace(req.params.id, req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Left workspace successfully',
    });
  } catch (error: any) {
    console.error('Leave workspace error:', error);

    if (error.message.includes('owner cannot leave')) {
      return res.status(403).json({
        error: 'OwnerCannotLeave',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to leave workspace',
    });
  }
});

/**
 * GET /api/workspaces/:id/stats
 * Get workspace statistics
 */
router.get('/:id/stats', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const stats = await workspaceService.getWorkspaceStats(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get workspace stats error:', error);

    if (error.message.includes('Access denied')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to get workspace statistics',
    });
  }
});

export default router;

