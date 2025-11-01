import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { checkRunLimit } from '../middleware/planLimitsMiddleware';
import { PrismaClient } from '@prisma/client';
import workflowQueue from '../config/queue';

const router = Router();
const prisma = new PrismaClient();

// All run routes require authentication
router.use(authMiddleware);

/**
 * POST /api/workflows/:workflowId/run
 * Start workflow execution
 */
router.post('/:workflowId/run', checkRunLimit, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const { workflowId } = req.params;
    const { inputData } = req.body;

    // Fetch workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Workflow not found',
      });
    }

    // Verify access (must be in same workspace or workflow must be public)
    if (!workflow.public && workflow.workspaceId !== req.user.workspaceId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this workflow',
      });
    }

    // Create run record
    const run = await prisma.run.create({
      data: {
        workflowId,
        workspaceId: req.user.workspaceId!,
        triggeredBy: req.user.userId,
        triggerType: 'manual',
        status: 'queued',
        inputData: inputData || {},
      },
    });

    // Enqueue job
    await workflowQueue.add({ runId: run.id });

    res.status(201).json({
      success: true,
      data: {
        runId: run.id,
        status: 'queued',
        message: 'Workflow execution queued',
      },
    });
  } catch (error: any) {
    console.error('Start run error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to start workflow execution',
    });
  }
});

/**
 * GET /api/runs
 * List workflow runs for workspace
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const { page = 1, limit = 50, status, workflowId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      workspaceId: req.user.workspaceId,
    };

    if (status) {
      where.status = status;
    }

    if (workflowId) {
      where.workflowId = workflowId;
    }

    const [runs, total] = await Promise.all([
      prisma.run.findMany({
        where,
        include: {
          workflow: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.run.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: runs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('List runs error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to list runs',
    });
  }
});

/**
 * GET /api/runs/:id
 * Get run details
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const run = await prisma.run.findUnique({
      where: { id: req.params.id },
      include: {
        workflow: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!run) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Run not found',
      });
    }

    // Verify access
    if (run.workspaceId !== req.user.workspaceId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this run',
      });
    }

    res.status(200).json({
      success: true,
      data: run,
    });
  } catch (error: any) {
    console.error('Get run error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to get run details',
    });
  }
});

/**
 * POST /api/runs/:id/cancel
 * Cancel running workflow
 */
router.post('/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const run = await prisma.run.findUnique({
      where: { id: req.params.id },
    });

    if (!run) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Run not found',
      });
    }

    // Verify access
    if (run.workspaceId !== req.user.workspaceId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this run',
      });
    }

    // Check if run is still cancellable
    if (run.status !== 'queued' && run.status !== 'running') {
      return res.status(400).json({
        error: 'BadRequest',
        message: `Cannot cancel run with status: ${run.status}`,
      });
    }

    // Update run status to cancelled
    await prisma.run.update({
      where: { id: req.params.id },
      data: {
        status: 'cancelled',
        finishedAt: new Date(),
      },
    });

    // TODO: Also cancel the Bull job if it's still in queue

    res.status(200).json({
      success: true,
      message: 'Run cancelled successfully',
    });
  } catch (error: any) {
    console.error('Cancel run error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to cancel run',
    });
  }
});

/**
 * DELETE /api/runs/:id
 * Delete run record
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const run = await prisma.run.findUnique({
      where: { id: req.params.id },
    });

    if (!run) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Run not found',
      });
    }

    // Verify access
    if (run.workspaceId !== req.user.workspaceId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this run',
      });
    }

    // Delete run
    await prisma.run.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: 'Run deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete run error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to delete run',
    });
  }
});

export default router;

