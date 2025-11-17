import { SubscriptionPlan, SubscriptionStatus, TaskPriority, TaskStatus } from '@prisma/client'

// Re-export Prisma enums for convenience
export { SubscriptionPlan, SubscriptionStatus, TaskPriority, TaskStatus }

// Entitlements configuration
export const PLAN_LIMITS = {
  FREE: {
    maxTasks: 10,
    canUseTags: false,
    canUsePriorities: false,
    canUseDueDates: false,
  },
  PRO: {
    maxTasks: Infinity,
    canUseTags: true,
    canUsePriorities: true,
    canUseDueDates: true,
  },
} as const

export type PlanLimits = (typeof PLAN_LIMITS)[keyof typeof PLAN_LIMITS]

// Helper type for API responses
export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// Task creation/update types
export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  dueDate?: Date
  tags?: string[]
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus
}

// User subscription info
export interface UserSubscription {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodEnd?: Date
  limits: PlanLimits
}
