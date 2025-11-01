/**
 * Workflow API Routes
 */

import { Router, Request, Response } from 'express';
import { WorkflowDatabase } from '../services/workflowDatabase';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';

const router = Router();

// Initialize with correct paths relative to project root
// When running from apps/backend, go up 2 levels to reach project root
const projectRoot = resolve(process.cwd(), '../..');
const dbPath = join(projectRoot, 'database/workflows.db');
const workflowsDir = join(projectRoot, 'workflows');
const db = new WorkflowDatabase(dbPath, workflowsDir);

/**
 * GET /api/workflows/stats
 * Get workflow statistics (must be before /:filename route)
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

/**
 * GET /api/workflows
 * Search and list workflows
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      q = '',
      trigger = 'all',
      complexity = 'all',
      active_only = 'false',
      page = '1',
      per_page = '20',
    } = req.query;

    const result = db.search({
      query: q as string,
      trigger: trigger as string,
      complexity: complexity as string,
      active_only: active_only === 'true',
      page: parseInt(page as string, 10),
      per_page: Math.min(parseInt(per_page as string, 10), 100),
    });

    res.json({
      ...result,
      query: q,
      filters: {
        trigger,
        complexity,
        active_only: active_only === 'true',
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search workflows' });
  }
});

/**
 * GET /api/workflows/:filename
 * Get workflow details by filename
 */
router.get('/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    const workflow = db.getWorkflow(filename);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ error: 'Failed to get workflow' });
  }
});

/**
 * GET /api/workflows/:filename/download
 * Download workflow JSON file
 */
router.get('/:filename/download', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    
    const workflow = db.getWorkflow(filename);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Find the file recursively
    const { readdirSync, statSync } = require('fs');
    const { join } = require('path');

    const findFile = (dir: string, target: string): string | null => {
      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          const found = findFile(fullPath, target);
          if (found) return found;
        } else if (entry.name === target) {
          return fullPath;
        }
      }
      
      return null;
    };

    const filePath = findFile('workflows', filename);
    
    if (!filePath) {
      return res.status(404).json({ error: 'Workflow file not found' });
    }

    const content = readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(json);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download workflow' });
  }
});

/**
 * POST /api/workflows/reindex
 * Reindex all workflows
 */
router.post('/reindex', async (req: Request, res: Response) => {
  try {
    const result = db.indexAllWorkflows(true);
    res.json({
      message: 'Workflows reindexed successfully',
      ...result,
    });
  } catch (error) {
    console.error('Reindex error:', error);
    res.status(500).json({ error: 'Failed to reindex workflows' });
  }
});

export default router;

