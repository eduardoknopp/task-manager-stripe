import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { STRIPE_CONFIG, STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe/config'
import { prisma } from '@/lib/db/prisma'
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    // Check for duplicate events (idempotency)
    const existingEvent = await prisma.stripeEvent.findUnique({
      where: { stripeEventId: event.id },
    })

    if (existingEvent) {
      console.log('Duplicate event, skipping:', event.id)
      return NextResponse.json({ received: true })
    }

    // Log event
    await prisma.stripeEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        data: event.data.object as any,
        processed: false,
      },
    })

    // Handle different event types
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdate(event)
        break

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event)
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
        await handlePaymentSucceeded(event)
        break

      case STRIPE_WEBHOOK_EVENTS.PAYMENT_FAILED:
        await handlePaymentFailed(event)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark event as processed
    await prisma.stripeEvent.update({
      where: { stripeEventId: event.id },
      data: { processed: true },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)

    // Log error but don't mark as processed
    await prisma.stripeEvent.update({
      where: { stripeEventId: event.id },
      data: {
        processed: false,
        processingError: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionUpdate(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  const plan = subscription.status === 'active' ? SubscriptionPlan.PRO : SubscriptionPlan.FREE
  const status = mapStripeStatus(subscription.status)

  // Validate period end timestamp
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null

  await prisma.subscription.upsert({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    update: {
      plan,
      status,
      stripePriceId: subscription.items.data[0]?.price.id,
      ...(periodEnd && { stripeCurrentPeriodEnd: periodEnd }),
    },
    create: {
      userId,
      plan,
      status,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: periodEnd,
    },
  })

  // Ensure EntitlementUsage exists
  await prisma.entitlementUsage.upsert({
    where: { userId },
    update: { updatedAt: new Date() },
    create: {
      userId,
      taskCount: 0,
    },
  })

  console.log(`Subscription updated for user ${userId}:`, plan, status)
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription
  const userId = subscription.metadata.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.CANCELED,
    },
  })

  console.log(`Subscription canceled for user ${userId}`)
}

async function handlePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  const subscriptionId = invoice.subscription as string

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        status: SubscriptionStatus.ACTIVE,
      },
    })

    console.log(`Payment succeeded for subscription ${subscriptionId}`)
  }
}

async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice
  const subscriptionId = invoice.subscription as string

  if (subscriptionId) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    })

    console.log(`Payment failed for subscription ${subscriptionId}`)
  }
}

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    canceled: SubscriptionStatus.CANCELED,
    past_due: SubscriptionStatus.PAST_DUE,
    unpaid: SubscriptionStatus.UNPAID,
    incomplete: SubscriptionStatus.INCOMPLETE,
    trialing: SubscriptionStatus.TRIALING,
  }

  return statusMap[stripeStatus] || SubscriptionStatus.ACTIVE
}
