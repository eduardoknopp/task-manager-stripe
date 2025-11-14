import { prisma } from '@/lib/db/prisma'
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client'
import { stripe } from './client'

/**
 * Get user's current subscription from database
 */
export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return subscription
}

/**
 * Check if user has active Pro subscription
 */
export async function hasProSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)

  if (!subscription) return false

  return (
    subscription.plan === SubscriptionPlan.PRO &&
    subscription.status === SubscriptionStatus.ACTIVE
  )
}

/**
 * Get subscription details from Stripe
 */
export async function getStripeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error)
    return null
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    return subscription
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    throw new Error('Failed to reactivate subscription')
  }
}
