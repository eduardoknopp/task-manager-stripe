import { stripe } from './client'
import { prisma } from '@/lib/db/prisma'

/**
 * Reports usage to Stripe for metered billing
 * Only reports if user has a metered subscription item
 */
export async function reportUsageToStripe(
  userId: string,
  quantity: number = 1
): Promise<void> {
  try {
    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription?.stripeSubscriptionId) {
      console.log('No active subscription for metered usage')
      return
    }

    // Get subscription items from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    )

    // Find metered subscription item (if exists)
    const meteredItem = stripeSubscription.items.data.find((item) => {
      return item.price.recurring?.usage_type === 'metered'
    })

    if (!meteredItem) {
      // No metered billing configured, skip
      return
    }

    // Report usage to Stripe
    await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
      quantity,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    })

    console.log(`Reported ${quantity} usage to Stripe for user ${userId}`)
  } catch (error) {
    // Don't throw - metered usage is optional, shouldn't break task creation
    console.error('Error reporting usage to Stripe:', error)
  }
}

/**
 * Gets current period usage from Stripe
 * Useful for displaying usage stats to users
 */
export async function getCurrentPeriodUsage(
  userId: string
): Promise<number | null> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription?.stripeSubscriptionId) {
      return null
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    )

    const meteredItem = stripeSubscription.items.data.find((item) => {
      return item.price.recurring?.usage_type === 'metered'
    })

    if (!meteredItem) {
      return null
    }

    // Get usage records for current period
    const usageRecords = await stripe.subscriptionItems.listUsageRecordSummaries(
      meteredItem.id,
      {
        limit: 100,
      }
    )

    // Sum total usage
    const totalUsage = usageRecords.data.reduce(
      (sum, record) => sum + record.total_usage,
      0
    )

    return totalUsage
  } catch (error) {
    console.error('Error fetching usage from Stripe:', error)
    return null
  }
}
