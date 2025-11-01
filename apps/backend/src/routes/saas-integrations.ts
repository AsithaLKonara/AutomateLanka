import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { integrationService } from '../services/integrationService';
import { z } from 'zod';

const router = Router();

// All integration routes require authentication
router.use(authMiddleware);

// Validation schemas
const startOAuthSchema = z.object({
  type: z.enum(['slack', 'google', 'github', 'microsoft'], {
    errorMap: () => ({ message: 'Invalid integration type' }),
  }),
  workspaceId: z.string().uuid('Invalid workspace ID'),
});

const completeOAuthSchema = z.object({
  type: z.enum(['slack', 'google', 'github', 'microsoft']),
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State is required'),
});

/**
 * GET /api/saas-integrations
 * List workspace integrations
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const workspaceId = (req.query.workspaceId as string) || req.user.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'workspaceId is required',
      });
    }

    const integrations = await integrationService.listIntegrations(workspaceId);

    res.status(200).json({
      success: true,
      data: integrations,
      count: integrations.length,
    });
  } catch (error: any) {
    console.error('List integrations error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to list integrations',
    });
  }
});

/**
 * POST /api/saas-integrations/connect
 * Start OAuth flow
 */
router.post('/connect', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Validate input
    const validation = startOAuthSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid input data',
        details: validation.error.errors,
      });
    }

    const { type, workspaceId } = validation.data;

    const result = await integrationService.startOAuthFlow(
      type,
      workspaceId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Redirect user to authUrl to complete OAuth flow',
    });
  } catch (error: any) {
    console.error('Start OAuth error:', error);
    
    if (error.message.includes('Unsupported')) {
      return res.status(400).json({
        error: 'UnsupportedIntegration',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to start OAuth flow',
    });
  }
});

/**
 * POST /api/saas-integrations/callback
 * Complete OAuth flow (exchange code for tokens)
 */
router.post('/callback', async (req: AuthRequest, res: Response) => {
  try {
    // Validate input
    const validation = completeOAuthSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid input data',
        details: validation.error.errors,
      });
    }

    const { type, code, state } = validation.data;

    const result = await integrationService.completeOAuthFlow(type, code, state);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Integration connected successfully',
    });
  } catch (error: any) {
    console.error('Complete OAuth error:', error);

    if (error.message.includes('expired')) {
      return res.status(400).json({
        error: 'StateExpired',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to complete OAuth flow',
    });
  }
});

/**
 * POST /api/saas-integrations/:id/test
 * Test integration connection
 */
router.post('/:id/test', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const workspaceId = (req.query.workspaceId as string) || req.user.workspaceId!;

    const isValid = await integrationService.testIntegration(
      req.params.id,
      workspaceId
    );

    res.status(200).json({
      success: true,
      data: {
        valid: isValid,
        message: isValid
          ? 'Integration connection is valid'
          : 'Integration connection failed',
      },
    });
  } catch (error: any) {
    console.error('Test integration error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Integration not found',
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to test integration',
    });
  }
});

/**
 * DELETE /api/saas-integrations/:id
 * Disconnect integration
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const workspaceId = (req.query.workspaceId as string) || req.user.workspaceId!;

    await integrationService.deleteIntegration(req.params.id, workspaceId);

    res.status(200).json({
      success: true,
      message: 'Integration disconnected successfully',
    });
  } catch (error: any) {
    console.error('Delete integration error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Integration not found',
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to disconnect integration',
    });
  }
});

/**
 * GET /api/saas-integrations/types
 * Get available integration types
 */
router.get('/types', async (req: AuthRequest, res: Response) => {
  try {
    const types = [
      {
        type: 'slack',
        name: 'Slack',
        description: 'Send messages and notifications to Slack channels',
        icon: '💬',
        category: 'Communication',
        available: !!process.env.SLACK_CLIENT_ID,
      },
      {
        type: 'google',
        name: 'Google Workspace',
        description: 'Gmail, Sheets, Calendar, Drive integration',
        icon: '📧',
        category: 'Productivity',
        available: !!process.env.GOOGLE_CLIENT_ID,
      },
      {
        type: 'github',
        name: 'GitHub',
        description: 'Manage repositories, issues, and pull requests',
        icon: '🐙',
        category: 'Development',
        available: !!process.env.GITHUB_CLIENT_ID,
      },
      {
        type: 'microsoft',
        name: 'Microsoft 365',
        description: 'Outlook, Calendar, OneDrive integration',
        icon: '📨',
        category: 'Productivity',
        available: !!process.env.MICROSOFT_CLIENT_ID,
      },
    ];

    res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error: any) {
    console.error('Get integration types error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to get integration types',
    });
  }
});

export default router;

