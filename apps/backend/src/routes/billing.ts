import express, { Router, Response } from 'express'
import Stripe from 'stripe'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/authMiddleware'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Validation schemas
const createSubscriptionSchema = z.object({
  priceId: z.string(),
  paymentMethodId: z.string().optional()
})

const updateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  priceId: z.string().optional(),
  quantity: z.number().optional()
})

const createPaymentMethodSchema = z.object({
  type: z.enum(['card']),
  card: z.object({
    number: z.string(),
    exp_month: z.number(),
    exp_year: z.number(),
    cvc: z.string()
  }),
  billing_details: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.object({
      line1: z.string(),
      city: z.string(),
      state: z.string(),
      postal_code: z.string(),
      country: z.string()
    }).optional()
  })
})

// Get billing information
router.get('/info', asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's workspace to access subscription
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    // Get Stripe customer from subscription
    let stripeCustomer = null
    const stripeCustomerId = workspace?.subscription?.stripeCustomerId
    if (stripeCustomerId) {
      try {
        stripeCustomer = await stripe.customers.retrieve(stripeCustomerId)
      } catch (error) {
        console.error('Error fetching Stripe customer:', error)
      }
    }

    // Get payment methods
    let paymentMethods: any[] = []
    if (stripeCustomerId) {
      try {
        const methods = await stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: 'card'
        })
        paymentMethods = methods.data
      } catch (error) {
        console.error('Error fetching payment methods:', error)
      }
    }

    // Get subscriptions for user's workspaces
    const subscriptions = workspace?.subscription 
      ? [workspace.subscription] 
      : []

    res.json({
      user: {
        id: user.id,
        email: user.email,
        stripeCustomerId: stripeCustomerId || null
      },
      stripeCustomer,
      paymentMethods,
      subscriptions
    })
}))

// Create or update Stripe customer
router.post('/customer', asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's workspace to access/update subscription
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' })
    }

    let stripeCustomer
    const existingCustomerId = workspace.subscription?.stripeCustomerId

    if (existingCustomerId) {
      // Update existing customer
      stripeCustomer = await stripe.customers.update(existingCustomerId, {
        email: user.email,
        name: user.name || user.email,
        metadata: {
          user_id: user.id,
          workspace_id: workspace.id
        }
      })
    } else {
      // Create new customer
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.email,
        metadata: {
          user_id: user.id,
          workspace_id: workspace.id
        }
      })

      // Update subscription with Stripe customer ID
      if (workspace.subscription) {
        await prisma.subscription.update({
          where: { id: workspace.subscription.id },
          data: { stripeCustomerId: stripeCustomer.id }
        })
      } else {
        // Create subscription if it doesn't exist
        await prisma.subscription.create({
          data: {
            workspaceId: workspace.id,
            planId: workspace.planId || 'free', // Default to free plan
            stripeCustomerId: stripeCustomer.id,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        })
      }
    }

    res.json({ customer: stripeCustomer })
}))

// Create payment method
router.post('/payment-methods', asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.userId

    const validatedData = createPaymentMethodSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's workspace to access subscription
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    const stripeCustomerId = workspace?.subscription?.stripeCustomerId
    if (!stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found. Create customer first.' })
    }

    // Create payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: validatedData.type,
      card: validatedData.card,
      billing_details: validatedData.billing_details
    })

    // Attach to customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: stripeCustomerId
    })

    // Set as default if it's the first payment method
    const existingMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card'
    })

    if (existingMethods.data.length === 1) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id
        }
      })
    }

    res.json({ paymentMethod })
}))

// Get payment methods
router.get('/payment-methods', asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.json({ paymentMethods: [] })
    }

    // Get user's workspace to access subscription
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    const stripeCustomerId = workspace?.subscription?.stripeCustomerId
    if (!stripeCustomerId) {
      return res.json({ paymentMethods: [] })
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card'
    })

    res.json({ paymentMethods: paymentMethods.data })
}))

// Delete payment method
router.delete('/payment-methods/:paymentMethodId', asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.userId

    const { paymentMethodId } = req.params

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's workspace to access subscription
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    const stripeCustomerId = workspace?.subscription?.stripeCustomerId
    if (!stripeCustomerId) {
      return res.status(404).json({ error: 'Stripe customer not found' })
    }

    // Verify payment method belongs to customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    if (paymentMethod.customer !== stripeCustomerId) {
      return res.status(403).json({ error: 'Payment method does not belong to user' })
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId)

    res.json({ success: true })
}))

// Create subscription
router.post('/subscriptions', asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.userId

    const validatedData = createSubscriptionSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's workspace (or create one if none exists)
    let workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    if (!workspace) {
      // Create workspace if it doesn't exist
      workspace = await prisma.workspace.create({
        data: {
          name: `${user.name || user.email}'s Workspace`,
          slug: `${user.name?.toLowerCase().replace(/\s+/g, '-') || user.email.split('@')[0]}-workspace`,
          ownerId: user.id
        },
        include: {
          subscription: true
        }
      })
    }

    // Get or create Stripe customer
    let stripeCustomerId = workspace.subscription?.stripeCustomerId
    if (!stripeCustomerId) {
      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.email,
        metadata: {
          user_id: user.id,
          workspace_id: workspace.id
        }
      })
      stripeCustomerId = stripeCustomer.id

      // Update or create subscription with customer ID
      if (workspace.subscription) {
        await prisma.subscription.update({
          where: { id: workspace.subscription.id },
          data: { stripeCustomerId: stripeCustomer.id }
        })
      } else {
        await prisma.subscription.create({
          data: {
            workspaceId: workspace.id,
            planId: workspace.planId || 'free',
            stripeCustomerId: stripeCustomer.id,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        })
      }
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: validatedData.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: user.id,
        workspace_id: workspace.id
      }
    })

    // Update subscription in database
    const dbSubscription = await prisma.subscription.update({
      where: { workspaceId: workspace.id },
      data: {
        stripeSubscriptionId: subscription.id,
        planId: validatedData.priceId, // Assuming priceId maps to planId
        status: subscription.status as any
      }
    })

    res.json({ 
      subscription,
      dbSubscription,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
    })
}))

// Get subscriptions
router.get('/subscriptions', asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's workspaces and their subscriptions
    const workspaces = await prisma.workspace.findMany({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    // Fetch Stripe subscription details
    const subscriptionsWithStripe = await Promise.all(
      workspaces
        .filter(w => w.subscription?.stripeSubscriptionId)
        .map(async (w) => {
          const sub = w.subscription!
          try {
            const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId!)
            return {
              ...sub,
              workspace: { id: w.id, name: w.name },
              stripeSubscription
            }
          } catch (error) {
            console.error(`Error fetching Stripe subscription ${sub.stripeSubscriptionId}:`, error)
            return {
              ...sub,
              workspace: { id: w.id, name: w.name }
            }
          }
        })
    )

    res.json({ subscriptions: subscriptionsWithStripe })
}))

// Update subscription
router.put('/subscriptions/:subscriptionId', asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.userId

    const { subscriptionId } = req.params
    const validatedData = updateSubscriptionSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's workspaces
    const workspaces = await prisma.workspace.findMany({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    // Verify subscription belongs to user's workspace
    const subscription = workspaces
      .map(w => w.subscription)
      .find(sub => sub?.stripeSubscriptionId === subscriptionId)

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    // Update Stripe subscription
    const updateData: any = {}
    if (validatedData.priceId) {
      updateData.items = [{ price: validatedData.priceId }]
    }
    if (validatedData.quantity) {
      updateData.quantity = validatedData.quantity
    }

    const stripeSubscription = await stripe.subscriptions.update(subscriptionId, updateData)

    // Update database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription!.id },
      data: {
        planId: validatedData.priceId || subscription!.planId,
        status: stripeSubscription.status as any
      }
    })

    res.json({ 
      subscription: updatedSubscription,
      stripeSubscription
    })
}))

// Cancel subscription
router.delete('/subscriptions/:subscriptionId', asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.userId

    const { subscriptionId } = req.params

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's workspaces
    const workspaces = await prisma.workspace.findMany({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    // Verify subscription belongs to user's workspace
    const subscription = workspaces
      .map(w => w.subscription)
      .find(sub => sub?.stripeSubscriptionId === subscriptionId)

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    // Cancel Stripe subscription
    const stripeSubscription = await stripe.subscriptions.cancel(subscriptionId)

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled'
      }
    })

    res.json({ 
      subscription: stripeSubscription,
      message: 'Subscription cancelled successfully'
    })
}))

// Get invoices
router.get('/invoices', asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    const userId = req.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.json({ invoices: [] })
    }

    // Get user's workspace to access subscription
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
      include: {
        subscription: true
      }
    })

    const stripeCustomerId = workspace?.subscription?.stripeCustomerId
    if (!stripeCustomerId) {
      return res.json({ invoices: [] })
    }

    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 50
    })

    res.json({ invoices: invoices.data })
}))

// Get pricing plans
router.get('/pricing', asyncHandler(async (req: AuthRequest, res: Response) => {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100
    })

    // Group prices by product
    const plans = prices.data.reduce((acc: Record<string, any>, price) => {
      const product = price.product as any
      if (!acc[product.id]) {
        acc[product.id] = {
          id: product.id,
          name: product.name,
          description: product.description,
          prices: []
        }
      }
      acc[product.id].prices.push({
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        intervalCount: price.recurring?.interval_count
      })
      return acc
    }, {})

    res.json({ plans: Object.values(plans) })
}))

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req: express.Request, res: Response) => {
  const sig = req.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).send('Webhook Error')
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        // Find workspace from metadata
        const workspaceId = subscription.metadata.workspace_id
        if (workspaceId) {
          await prisma.subscription.upsert({
            where: { workspaceId },
            update: {
              status: subscription.status as any,
              planId: subscription.items.data[0]?.price.id,
              stripeSubscriptionId: subscription.id
            },
            create: {
              workspaceId,
              planId: subscription.items.data[0]?.price.id || 'free',
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              status: subscription.status as any,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000)
            }
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'cancelled' }
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        // Handle successful payment
        console.log('Payment succeeded for invoice:', invoice.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // Handle failed payment
        console.log('Payment failed for invoice:', invoice.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}))

export default router
