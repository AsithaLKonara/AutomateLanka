import express from 'express';
import { AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Stubbed Notifications API
 * The Notification model does not currently exist in the primary schema.
 * Returning empty/mock responses for now.
 */

// Get user notifications
router.get('/', async (req: AuthRequest, res) => {
  res.json({
    notifications: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  });
});

// Get notification by ID
router.get('/:id', async (req: AuthRequest, res) => {
  res.status(404).json({ error: 'Notification not found' });
});

// Create notification
router.post('/', async (req: AuthRequest, res) => {
  // Mock success
  res.status(201).json({
    notification: {
      id: 'mock-id',
      ...req.body,
      createdAt: new Date()
    }
  });
});

// Update notification (mark read etc)
router.put('/:id', async (req: AuthRequest, res) => {
  res.json({ success: true });
});

// Delete notification
router.delete('/:id', async (req: AuthRequest, res) => {
  res.json({ success: true });
});

// Mark all read
router.post('/mark-all-read', async (req: AuthRequest, res) => {
  res.json({ success: true, updatedCount: 0 });
});

// Stats
router.get('/stats/summary', async (req: AuthRequest, res) => {
  res.json({
    stats: {
      total: 0,
      unread: 0,
      read: 0,
      byType: {}
    }
  });
});

// Bulk ops
router.post('/bulk', async (req: AuthRequest, res) => {
  res.json({ success: true, updatedCount: 0 });
});

export default router;
