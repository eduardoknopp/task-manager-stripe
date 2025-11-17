import { SubscriptionPlan } from '@prisma/client'

/**
 * Stripe Feature Lookup Keys
 * These MUST match the "Chave de pesquisa" values in Stripe Dashboard
 */
export const STRIPE_FEATURES = {
  TASK_PRIORITY: 'task_priority',
  TASK_TAGS: 'task_tags',
} as const

export type StripeFeature = (typeof STRIPE_FEATURES)[keyof typeof STRIPE_FEATURES]

/**
 * Default Numerical Limits by Plan (Fallback)
 * These are used when Stripe metadata is unavailable
 * PRO limits should be fetched from Stripe product metadata
 */
export const DEFAULT_PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: {
    maxTasks: 2,
  },
  [SubscriptionPlan.PRO]: {
    maxTasks: Infinity,
  },
} as const

export type PlanLimits = {
  maxTasks: number
}

/**
 * Feature Names (used in code)
 */
export type PlanFeature =
  | 'taskCreation'
  | 'taskDueDate'
  | 'taskPriority'
  | 'taskTags'

/**
 * Map code features to Stripe lookup keys
 * null = basic feature (no Stripe check needed)
 */
export const FEATURE_TO_STRIPE: Record<PlanFeature, StripeFeature | null> = {
  // Basic features (always available)
  taskCreation: null,
  taskDueDate: null,

  // Premium features (require Stripe entitlement)
  taskPriority: STRIPE_FEATURES.TASK_PRIORITY,
  taskTags: STRIPE_FEATURES.TASK_TAGS,
}

/**
 * Error Messages
 */
export const ERRORS = {
  TASK_LIMIT: 'You have reached the task limit for the Free plan (2 tasks)',
  FEATURE_UNAVAILABLE: 'This feature is not available on your plan',
  UPGRADE_REQUIRED: 'Upgrade to Pro to unlock this feature',
} as const
