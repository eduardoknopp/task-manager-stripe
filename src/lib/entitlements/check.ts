import { SubscriptionPlan } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { stripe } from '@/lib/stripe/client'
import { FEATURE_TO_STRIPE, ERRORS, PlanFeature } from './config'
import { getPlanLimits } from './limits'

export interface EntitlementResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: boolean
}

export interface UsageStats {
  taskCount: number
  maxTasks: number
  plan: SubscriptionPlan
}

/**
 * Get user's usage statistics
 * Accepts ACTIVE, TRIALING, and INCOMPLETE statuses to handle payment processing delays
 * Fetches limits dynamically from Stripe product metadata
 */
export async function getUserUsage(userId: string): Promise<UsageStats | null> {
  const [subscription, usage] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'TRIALING', 'INCOMPLETE']
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.entitlementUsage.findUnique({
      where: { userId },
    }),
  ])

  if (!subscription || !usage) return null

  // Fetch limits dynamically from Stripe (with fallback to defaults)
  const limits = await getPlanLimits(subscription.stripePriceId, subscription.plan)

  return {
    taskCount: usage.taskCount,
    maxTasks: limits.maxTasks,
    plan: subscription.plan,
  }
}

/**
 * Check if user can create a task
 */
export async function canCreateTask(userId: string): Promise<EntitlementResult> {
  const usage = await getUserUsage(userId)

  if (!usage) {
    return { allowed: false, reason: 'Subscription not found' }
  }

  if (usage.taskCount >= usage.maxTasks) {
    return {
      allowed: false,
      reason: ERRORS.TASK_LIMIT,
      upgradeRequired: usage.plan === SubscriptionPlan.FREE,
    }
  }

  return { allowed: true }
}


/**
 * Check if user has access to a feature
 * For PRO users with Stripe features: Checks Stripe entitlements
 * For FREE users: Only basic features allowed
 * Accepts ACTIVE, TRIALING, and INCOMPLETE statuses to handle payment processing delays
 */
export async function hasFeatureAccess(
  userId: string,
  feature: PlanFeature
): Promise<EntitlementResult> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ['ACTIVE', 'TRIALING', 'INCOMPLETE']
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription) {
    return { allowed: false, reason: 'No active subscription' }
  }

  const stripeLookupKey = FEATURE_TO_STRIPE[feature]

  // Basic feature (no Stripe check needed)
  if (!stripeLookupKey) {
    return { allowed: true }
  }

  // Premium feature - FREE users don't have access
  if (subscription.plan === SubscriptionPlan.FREE) {
    return {
      allowed: false,
      reason: ERRORS.UPGRADE_REQUIRED,
      upgradeRequired: true,
    }
  }

  // PRO user - check Stripe entitlements
  if (!subscription.stripeCustomerId) {
    return { allowed: false, reason: 'Stripe customer not found' }
  }

  try {
    const entitlements = await stripe.entitlements.activeEntitlements.list({
      customer: subscription.stripeCustomerId,
      limit: 100,
    })

    const hasEntitlement = entitlements.data.some(
      (e) => e.lookup_key === stripeLookupKey
    )

    if (!hasEntitlement) {
      return {
        allowed: false,
        reason: ERRORS.FEATURE_UNAVAILABLE,
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Error checking Stripe entitlements:', error)
    return { allowed: false, reason: 'Unable to verify with Stripe' }
  }
}

/**
 * Increment/Decrement usage counters
 */
export async function incrementTaskCount(userId: string) {
  await prisma.entitlementUsage.update({
    where: { userId },
    data: { taskCount: { increment: 1 } },
  })
}

export async function decrementTaskCount(userId: string) {
  await prisma.entitlementUsage.update({
    where: { userId },
    data: { taskCount: { decrement: 1 } },
  })
}
