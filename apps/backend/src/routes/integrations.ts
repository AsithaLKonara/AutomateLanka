import express from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Stubbed Integrations API (Legacy)
 * New integration logic is in saas-integrations.ts
 */

router.get('/', async (req: AuthRequest, res) => {
  res.json({ integrations: [] });
});

router.post('/', async (req: AuthRequest, res) => {
  res.status(201).json({ integration: req.body });
});

router.get('/:id', async (req: AuthRequest, res) => {
  res.status(404).json({ error: 'Integration not found' });
});

router.put('/:id', async (req: AuthRequest, res) => {
  res.json({ integration: req.body });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  res.json({ success: true });
});

export default router;
