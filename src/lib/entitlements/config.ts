import { SubscriptionPlan } from '@prisma/client'

/**
 * Stripe Feature Lookup Keys
 * These MUST match the "Chave de pesquisa" values in Stripe Dashboard
 */
export const STRIPE_FEATURES = {
  TASK_PRIORITY: 'task_priority',
  TASK_TAGS: 'task_tags',
  PROJECT_COLORS: 'project_colors',
  DATA_EXPORT: 'data_export',
} as const

export type StripeFeature = (typeof STRIPE_FEATURES)[keyof typeof STRIPE_FEATURES]

/**
 * Numerical Limits by Plan
 * Managed in code, not in Stripe
 */
export const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: {
    maxTasks: 10,
    maxProjects: 2,
  },
  [SubscriptionPlan.PRO]: {
    maxTasks: Infinity,
    maxProjects: Infinity,
  },
} as const

/**
 * Feature Names (used in code)
 */
export type PlanFeature =
  | 'taskCreation'
  | 'taskDueDate'
  | 'projectCreation'
  | 'taskPriority'
  | 'taskTags'
  | 'projectColors'
  | 'dataExport'

/**
 * Map code features to Stripe lookup keys
 * null = basic feature (no Stripe check needed)
 */
export const FEATURE_TO_STRIPE: Record<PlanFeature, StripeFeature | null> = {
  // Basic features (always available)
  taskCreation: null,
  taskDueDate: null,
  projectCreation: null,

  // Premium features (require Stripe entitlement)
  taskPriority: STRIPE_FEATURES.TASK_PRIORITY,
  taskTags: STRIPE_FEATURES.TASK_TAGS,
  projectColors: STRIPE_FEATURES.PROJECT_COLORS,
  dataExport: STRIPE_FEATURES.DATA_EXPORT,
}

/**
 * Error Messages
 */
export const ERRORS = {
  TASK_LIMIT: 'Você atingiu o limite de tarefas do plano Free (10 tarefas)',
  PROJECT_LIMIT: 'Você atingiu o limite de projetos do plano Free (2 projetos)',
  FEATURE_UNAVAILABLE: 'Esta funcionalidade não está disponível no seu plano',
  UPGRADE_REQUIRED: 'Faça upgrade para Pro para desbloquear esta funcionalidade',
} as const
