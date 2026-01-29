import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import prisma from '../lib/prisma';

const router = express.Router();

/**
 * GET /api/analytics
 * Get dashboard analytics
 */
router.get('/', async (req: any, res) => {
  try {
    const workspaceId = req.query.workspaceId;

    if (!workspaceId) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Workspace ID required' });
      }
      // Admin global stats
      const [users, workspaces, workflows, runs] = await Promise.all([
        prisma.user.count(),
        prisma.workspace.count(),
        prisma.workflow.count(),
        prisma.run.count(),
      ]);

      return res.json({
        success: true,
        data: { users, workspaces, workflows, runs },
      });
    }

    // Workspace specific stats
    if (req.user.workspaceId !== workspaceId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalWorkflows, activeWorkflows, totalRuns, monthlyRuns, failedRuns] = await Promise.all([
      prisma.workflow.count({ where: { workspaceId } }),
      prisma.workflow.count({ where: { workspaceId, active: true } }),
      prisma.run.count({ where: { workspaceId } }),
      prisma.run.count({
        where: {
          workspaceId,
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.run.count({
        where: {
          workspaceId,
          status: 'failed',
          createdAt: { gte: startOfMonth }
        }
      }),
    ]);

    res.json({
      success: true,
      data: {
        workflows: {
          total: totalWorkflows,
          active: activeWorkflows,
        },
        runs: {
          total: totalRuns,
          thisMonth: monthlyRuns,
          failedThisMonth: failedRuns,
          successRate: monthlyRuns > 0 ? ((monthlyRuns - failedRuns) / monthlyRuns) * 100 : 100
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
