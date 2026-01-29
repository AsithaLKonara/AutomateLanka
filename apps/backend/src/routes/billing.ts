import express from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Stubbed Billing API (Legacy)
 * New billing logic is in saas-billing.ts
 */

router.get('/subscription', async (req: AuthRequest, res) => {
  res.json({
    subscription: null,
    plan: null
  });
});

router.post('/checkout', async (req: AuthRequest, res) => {
  res.status(501).json({ error: 'Use new billing endpoint' });
});

router.post('/portal', async (req: AuthRequest, res) => {
  res.status(501).json({ error: 'Use new billing endpoint' });
});

router.get('/plans', async (req: AuthRequest, res) => {
  res.json({ plans: [] });
});

router.post('/webhook', async (req, res) => {
  res.json({ received: true });
});

export default router;
