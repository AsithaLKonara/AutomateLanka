import { Router, Response } from 'express';
import { billingService, CreateCheckoutSessionInput } from '../services/billingService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// All billing routes require authentication
router.use(authMiddleware);

// Validation schemas
const checkoutSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
});

const portalSchema = z.object({
  returnUrl: z.string().url('Invalid return URL'),
});

/**
 * GET /api/saas-billing/plans
 * Get all available plans
 */
router.get('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const plans = await billingService.getPlans();

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    console.error('Get plans error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to get plans',
    });
  }
});

/**
 * POST /api/saas-billing/checkout
 * Create Stripe checkout session for subscription
 */
router.post('/checkout', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Validate input
    const validation = checkoutSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid input data',
        details: validation.error.errors,
      });
    }

    const { planId, successUrl, cancelUrl } = validation.data;

    // Workspace ID should come from query or body
    const workspaceId = req.query.workspaceId as string || req.body.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'workspaceId is required',
      });
    }

    const input: CreateCheckoutSessionInput = {
      workspaceId,
      planId,
      userId: req.user.userId,
      successUrl,
      cancelUrl,
    };

    const session = await billingService.createCheckoutSession(input);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Create checkout session error:', error);

    if (error.message.includes('Only workspace owner')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message,
      });
    }

    if (error.message.includes('already has an active subscription')) {
      return res.status(409).json({
        error: 'AlreadySubscribed',
        message: error.message,
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'NotFound',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to create checkout session',
    });
  }
});

/**
 * POST /api/saas-billing/portal
 * Create Stripe customer portal session
 */
router.post('/portal', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Validate input
    const validation = portalSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid input data',
        details: validation.error.errors,
      });
    }

    const { returnUrl } = validation.data;
    const workspaceId = req.query.workspaceId as string || req.body.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'workspaceId is required',
      });
    }

    const session = await billingService.createPortalSession({
      workspaceId,
      returnUrl,
    });

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    console.error('Create portal session error:', error);

    if (error.message.includes('No active subscription')) {
      return res.status(404).json({
        error: 'NotFound',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to create portal session',
    });
  }
});

/**
 * GET /api/saas-billing/usage
 * Get workspace usage for current period
 */
router.get('/usage', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const workspaceId = req.query.workspaceId as string;

    if (!workspaceId) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'workspaceId is required',
      });
    }

    const usage = await billingService.getWorkspaceUsage(workspaceId);

    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (error: any) {
    console.error('Get usage error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to get usage',
    });
  }
});

/**
 * POST /api/saas-billing/webhook
 * Handle Stripe webhook events
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).send('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Handle the event
      await billingService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

/**
 * GET /api/saas-billing/subscription
 * Get workspace subscription details
 */
router.get('/subscription', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const workspaceId = req.query.workspaceId as string;

    if (!workspaceId) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'workspaceId is required',
      });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { workspaceId },
      include: { plan: true },
    });

    if (!subscription) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'No subscription found',
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      error: 'ServerError',
      message: 'Failed to get subscription',
    });
  }
});

// Fix: Import express and prisma
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default router;

