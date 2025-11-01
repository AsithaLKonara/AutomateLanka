import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreateCheckoutSessionInput {
  workspaceId: string;
  planId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalSessionInput {
  workspaceId: string;
  returnUrl: string;
}

export class BillingService {
  /**
   * Get all available plans
   */
  async getPlans() {
    const plans = await prisma.plan.findMany({
      orderBy: {
        priceMonthly: 'asc',
      },
    });

    return plans;
  }

  /**
   * Get plan by ID
   */
  async getPlan(planId: string) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    return plan;
  }

  /**
   * Create Stripe checkout session for subscription
   */
  async createCheckoutSession(input: CreateCheckoutSessionInput) {
    // Get plan details
    const plan = await this.getPlan(input.planId);

    // Get workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: input.workspaceId },
      include: { owner: true },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Verify user is owner
    if (workspace.ownerId !== input.userId) {
      throw new Error('Only workspace owner can manage billing');
    }

    // Check if workspace already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { workspaceId: input.workspaceId },
    });

    if (existingSubscription && existingSubscription.status === 'active') {
      throw new Error('Workspace already has an active subscription. Please cancel current subscription first.');
    }

    // Get or create Stripe customer
    let customerId = existingSubscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: workspace.owner.email,
        metadata: {
          workspaceId: workspace.id,
          userId: workspace.ownerId,
        },
      });
      customerId = customer.id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `AutomateLanka ${plan.name} Plan`,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: Math.round(Number(plan.priceMonthly) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        workspaceId: workspace.id,
        planId: plan.id,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create Stripe customer portal session
   */
  async createPortalSession(input: CreatePortalSessionInput) {
    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { workspaceId: input.workspaceId },
    });

    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error('No active subscription found');
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: input.returnUrl,
    });

    return {
      url: session.url,
    };
  }

  /**
   * Handle Stripe webhook event
   */
  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handler error:', error);
      throw error;
    }
  }

  /**
   * Get workspace usage for current period
   */
  async getWorkspaceUsage(workspaceId: string) {
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get or create usage record
    let usageRecord = await prisma.usageRecord.findUnique({
      where: {
        workspaceId_periodStart: {
          workspaceId,
          periodStart,
        },
      },
    });

    if (!usageRecord) {
      usageRecord = await prisma.usageRecord.create({
        data: {
          workspaceId,
          periodStart,
          periodEnd,
          runsCount: 0,
          nodeExecutions: 0,
          apiCalls: 0,
        },
      });
    }

    // Get workspace plan limits
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { plan: true },
    });

    if (!workspace || !workspace.plan) {
      throw new Error('Workspace or plan not found');
    }

    return {
      current: {
        runs: usageRecord.runsCount,
        nodeExecutions: usageRecord.nodeExecutions,
        apiCalls: usageRecord.apiCalls,
      },
      limits: {
        runs: workspace.plan.runsPerMonth,
        workflows: workspace.plan.maxWorkflows,
        members: workspace.plan.maxMembers,
      },
      period: {
        start: periodStart,
        end: periodEnd,
      },
      percentUsed: {
        runs: workspace.plan.runsPerMonth === -1 
          ? 0 
          : (usageRecord.runsCount / workspace.plan.runsPerMonth) * 100,
      },
    };
  }

  /**
   * Increment usage counter
   */
  async incrementUsage(workspaceId: string, type: 'runs' | 'nodeExecutions' | 'apiCalls', amount: number = 1) {
    const today = new Date();
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const field = type === 'runs' ? 'runsCount' : type === 'nodeExecutions' ? 'nodeExecutions' : 'apiCalls';

    await prisma.usageRecord.upsert({
      where: {
        workspaceId_periodStart: {
          workspaceId,
          periodStart,
        },
      },
      update: {
        [field]: {
          increment: amount,
        },
      },
      create: {
        workspaceId,
        periodStart,
        periodEnd,
        [field]: amount,
      },
    });
  }

  /**
   * Check if workspace can perform action based on plan limits
   */
  async checkLimit(workspaceId: string, type: 'runs' | 'workflows' | 'members'): Promise<{ allowed: boolean; reason?: string }> {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { plan: true },
    });

    if (!workspace || !workspace.plan) {
      return { allowed: false, reason: 'Workspace or plan not found' };
    }

    const plan = workspace.plan;

    // Check runs limit
    if (type === 'runs') {
      if (plan.runsPerMonth === -1) {
        return { allowed: true }; // Unlimited
      }

      const usage = await this.getWorkspaceUsage(workspaceId);
      if (usage.current.runs >= plan.runsPerMonth) {
        return {
          allowed: false,
          reason: `Monthly run limit reached (${plan.runsPerMonth} runs). Upgrade your plan to continue.`,
        };
      }
    }

    // Check workflows limit
    if (type === 'workflows') {
      if (plan.maxWorkflows === -1) {
        return { allowed: true }; // Unlimited
      }

      const workflowCount = await prisma.workflow.count({
        where: { workspaceId },
      });

      if (workflowCount >= plan.maxWorkflows) {
        return {
          allowed: false,
          reason: `Workflow limit reached (${plan.maxWorkflows} workflows). Upgrade your plan to create more.`,
        };
      }
    }

    // Check members limit
    if (type === 'members') {
      if (plan.maxMembers === -1) {
        return { allowed: true }; // Unlimited
      }

      const memberCount = await prisma.membership.count({
        where: {
          workspaceId,
          acceptedAt: { not: null },
        },
      });

      if (memberCount >= plan.maxMembers) {
        return {
          allowed: false,
          reason: `Member limit reached (${plan.maxMembers} members). Upgrade your plan to invite more.`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Handle checkout session completed
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const workspaceId = session.metadata?.workspaceId;
    const planId = session.metadata?.planId;

    if (!workspaceId || !planId) {
      console.error('Missing metadata in checkout session');
      return;
    }

    // Update workspace plan
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { planId },
    });

    console.log(`Checkout completed for workspace ${workspaceId}`);
  }

  /**
   * Handle subscription created/updated
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      return;
    }

    const workspaceId = customer.metadata?.workspaceId;
    if (!workspaceId) {
      console.error('Missing workspaceId in customer metadata');
      return;
    }

    // Get plan from subscription
    const priceId = subscription.items.data[0]?.price.id;
    
    // Upsert subscription record
    await prisma.subscription.upsert({
      where: { workspaceId },
      update: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      create: {
        workspaceId,
        planId: (await prisma.workspace.findUnique({ where: { id: workspaceId } }))?.planId || '',
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });

    console.log(`Subscription updated for workspace ${workspaceId}: ${subscription.status}`);
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.deleted) {
      return;
    }

    const workspaceId = customer.metadata?.workspaceId;
    if (!workspaceId) {
      return;
    }

    // Get free plan
    const freePlan = await prisma.plan.findUnique({
      where: { slug: 'free' },
    });

    // Downgrade to free plan
    await prisma.$transaction(async (tx) => {
      await tx.workspace.update({
        where: { id: workspaceId },
        data: { planId: freePlan?.id },
      });

      await tx.subscription.update({
        where: { workspaceId },
        data: { status: 'cancelled' },
      });
    });

    console.log(`Subscription cancelled for workspace ${workspaceId}`);
  }

  /**
   * Handle invoice payment succeeded
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log(`Invoice payment succeeded: ${invoice.id}`);
    // Could send email notification here
  }

  /**
   * Handle invoice payment failed
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    console.log(`Invoice payment failed: ${invoice.id}`);
    // Could send email notification to admin
  }
}

// Export singleton instance
export const billingService = new BillingService();

