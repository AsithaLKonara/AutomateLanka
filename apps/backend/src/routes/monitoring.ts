import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import prisma from '../lib/prisma'

const router = express.Router()

// All monitoring routes require authentication
router.use(authMiddleware);

/**
 * GET /api/monitoring/stats
 * Get overall system stats (for admins only, or workspace-scoped)
 */
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const workspaceId = req.query.workspaceId as string;

    // If workspaceId is provided, scoped to that workspace
    const where = workspaceId ? { workspaceId } : {};

    const [totalRuns, failedRuns, activeWorkflows] = await Promise.all([
      prisma.run.count({ where }),
      prisma.run.count({ where: { ...where, status: 'failed' } }),
      prisma.workflow.count({ where: { ...where, active: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalRuns,
        failedRuns,
        activeWorkflows,
        successRate: totalRuns > 0 ? ((totalRuns - failedRuns) / totalRuns) * 100 : 100,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get monitoring stats' });
  }
});

export default router

