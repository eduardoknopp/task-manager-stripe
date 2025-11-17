import { SubscriptionPlan } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { stripe } from '@/lib/stripe/client'
import { PLAN_LIMITS, FEATURE_TO_STRIPE, ERRORS, PlanFeature } from './config'

export interface EntitlementResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: boolean
}

export interface UsageStats {
  taskCount: number
  projectCount: number
  maxTasks: number
  maxProjects: number
  plan: SubscriptionPlan
}

/**
 * Get user's usage statistics
 */
export async function getUserUsage(userId: string): Promise<UsageStats | null> {
  const [subscription, usage] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.entitlementUsage.findUnique({
      where: { userId },
    }),
  ])

  if (!subscription || !usage) return null

  const limits = PLAN_LIMITS[subscription.plan]

  return {
    taskCount: usage.taskCount,
    projectCount: usage.projectCount,
    maxTasks: limits.maxTasks,
    maxProjects: limits.maxProjects,
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
 * Check if user can create a project
 */
export async function canCreateProject(userId: string): Promise<EntitlementResult> {
  const usage = await getUserUsage(userId)

  if (!usage) {
    return { allowed: false, reason: 'Subscription not found' }
  }

  if (usage.projectCount >= usage.maxProjects) {
    return {
      allowed: false,
      reason: ERRORS.PROJECT_LIMIT,
      upgradeRequired: usage.plan === SubscriptionPlan.FREE,
    }
  }

  return { allowed: true }
}

/**
 * Check if user has access to a feature
 * For PRO users with Stripe features: Checks Stripe entitlements
 * For FREE users: Only basic features allowed
 */
export async function hasFeatureAccess(
  userId: string,
  feature: PlanFeature
): Promise<EntitlementResult> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
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

export async function incrementProjectCount(userId: string) {
  await prisma.entitlementUsage.update({
    where: { userId },
    data: { projectCount: { increment: 1 } },
  })
}

export async function decrementProjectCount(userId: string) {
  await prisma.entitlementUsage.update({
    where: { userId },
    data: { projectCount: { decrement: 1 } },
  })
}
