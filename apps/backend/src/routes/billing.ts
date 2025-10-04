import express from 'express'
import { PrismaClient } from '@autolanka/db'
import Stripe from 'stripe'
import { z } from 'zod'

const router = express.Router()
const prisma = new PrismaClient()

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
router.get('/info', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        subscriptions: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get Stripe customer
    let stripeCustomer = null
    if (user.stripe_customer_id) {
      try {
        stripeCustomer = await stripe.customers.retrieve(user.stripe_customer_id)
      } catch (error) {
        console.error('Error fetching Stripe customer:', error)
      }
    }

    // Get payment methods
    let paymentMethods = []
    if (user.stripe_customer_id) {
      try {
        const methods = await stripe.paymentMethods.list({
          customer: user.stripe_customer_id,
          type: 'card'
        })
        paymentMethods = methods.data
      } catch (error) {
        console.error('Error fetching payment methods:', error)
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        stripeCustomerId: user.stripe_customer_id
      },
      stripeCustomer,
      paymentMethods,
      subscriptions: user.subscriptions
    })
  } catch (error) {
    console.error('Error fetching billing info:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create or update Stripe customer
router.post('/customer', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    let stripeCustomer

    if (user.stripe_customer_id) {
      // Update existing customer
      stripeCustomer = await stripe.customers.update(user.stripe_customer_id, {
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        metadata: {
          user_id: user.id,
          clerk_id: user.clerk_id
        }
      })
    } else {
      // Create new customer
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        metadata: {
          user_id: user.id,
          clerk_id: user.clerk_id
        }
      })

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripe_customer_id: stripeCustomer.id }
      })
    }

    res.json({ customer: stripeCustomer })
  } catch (error) {
    console.error('Error creating/updating customer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create payment method
router.post('/payment-methods', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const validatedData = createPaymentMethodSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.stripe_customer_id) {
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
      customer: user.stripe_customer_id
    })

    // Set as default if it's the first payment method
    const existingMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card'
    })

    if (existingMethods.data.length === 1) {
      await stripe.customers.update(user.stripe_customer_id, {
        invoice_settings: {
          default_payment_method: paymentMethod.id
        }
      })
    }

    res.json({ paymentMethod })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error creating payment method:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user || !user.stripe_customer_id) {
      return res.json({ paymentMethods: [] })
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card'
    })

    res.json({ paymentMethods: paymentMethods.data })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete payment method
router.delete('/payment-methods/:paymentMethodId', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { paymentMethodId } = req.params

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user || !user.stripe_customer_id) {
      return res.status(404).json({ error: 'User or customer not found' })
    }

    // Verify payment method belongs to customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    if (paymentMethod.customer !== user.stripe_customer_id) {
      return res.status(403).json({ error: 'Payment method does not belong to user' })
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId)

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment method:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create subscription
router.post('/subscriptions', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const validatedData = createSubscriptionSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        organizations: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found. Create customer first.' })
    }

    // Get the first organization (or create one if none exists)
    let organization = user.organizations[0]
    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: `${user.first_name}'s Organization`,
          slug: `${user.first_name.toLowerCase()}-org`,
          created_by: user.id
        }
      })

      // Add user to organization
      await prisma.userOrganization.create({
        data: {
          user_id: user.id,
          org_id: organization.id,
          role: 'OWNER'
        }
      })
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: user.stripe_customer_id,
      items: [{ price: validatedData.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: user.id,
        organization_id: organization.id
      }
    })

    // Save subscription to database
    const dbSubscription = await prisma.subscription.create({
      data: {
        stripe_subscription_id: subscription.id,
        stripe_price_id: validatedData.priceId,
        status: subscription.status as any,
        org_id: organization.id,
        created_by: user.id
      }
    })

    res.json({ 
      subscription,
      dbSubscription,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error creating subscription:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        subscriptions: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Fetch Stripe subscription details
    const subscriptionsWithStripe = await Promise.all(
      user.subscriptions.map(async (sub) => {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)
          return {
            ...sub,
            stripeSubscription
          }
        } catch (error) {
          console.error(`Error fetching Stripe subscription ${sub.stripe_subscription_id}:`, error)
          return sub
        }
      })
    )

    res.json({ subscriptions: subscriptionsWithStripe })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update subscription
router.put('/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { subscriptionId } = req.params
    const validatedData = updateSubscriptionSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify subscription belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripe_subscription_id: subscriptionId,
        created_by: user.id
      }
    })

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
      where: { id: subscription.id },
      data: {
        stripe_price_id: validatedData.priceId || subscription.stripe_price_id,
        status: stripeSubscription.status as any
      }
    })

    res.json({ 
      subscription: updatedSubscription,
      stripeSubscription
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Error updating subscription:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Cancel subscription
router.delete('/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { subscriptionId } = req.params

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify subscription belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripe_subscription_id: subscriptionId,
        created_by: user.id
      }
    })

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    // Cancel Stripe subscription
    const stripeSubscription = await stripe.subscriptions.cancel(subscriptionId)

    // Update database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED'
      }
    })

    res.json({ 
      subscription: stripeSubscription,
      message: 'Subscription cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get invoices
router.get('/invoices', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId }
    })

    if (!user || !user.stripe_customer_id) {
      return res.json({ invoices: [] })
    }

    const invoices = await stripe.invoices.list({
      customer: user.stripe_customer_id,
      limit: 50
    })

    res.json({ invoices: invoices.data })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get pricing plans
router.get('/pricing', async (req, res) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
      limit: 100
    })

    // Group prices by product
    const plans = prices.data.reduce((acc, price) => {
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
  } catch (error) {
    console.error('Error fetching pricing:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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
        await prisma.subscription.upsert({
          where: { stripe_subscription_id: subscription.id },
          update: {
            status: subscription.status as any,
            stripe_price_id: subscription.items.data[0]?.price.id
          },
          create: {
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0]?.price.id,
            status: subscription.status as any,
            org_id: subscription.metadata.organization_id,
            created_by: subscription.metadata.user_id
          }
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripe_subscription_id: subscription.id },
          data: { status: 'CANCELLED' }
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
})

export default router
