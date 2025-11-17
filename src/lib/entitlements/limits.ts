import { SubscriptionPlan } from '@prisma/client'
import { stripe } from '@/lib/stripe/client'
import { DEFAULT_PLAN_LIMITS, PlanLimits } from './config'

/**
 * Cache for plan limits fetched from Stripe
 * Key: stripePriceId, Value: { limits, timestamp }
 */
let limitsCache: Map<string, { limits: PlanLimits; timestamp: number }> = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

/**
 * Fetches plan limits from Stripe product metadata
 * Falls back to DEFAULT_PLAN_LIMITS if metadata is unavailable
 */
export async function getPlanLimits(
  stripePriceId: string | null,
  plan: SubscriptionPlan
): Promise<PlanLimits> {
  // FREE plan always uses defaults (no Stripe product)
  if (plan === SubscriptionPlan.FREE || !stripePriceId) {
    return DEFAULT_PLAN_LIMITS[plan]
  }

  // Check cache first
  const cached = limitsCache.get(stripePriceId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.limits
  }

  try {
    // Fetch price with expanded product
    const price = await stripe.prices.retrieve(stripePriceId, {
      expand: ['product'],
    })

    const product = price.product as any
    const metadata = product.metadata || {}

    // Parse metadata
    const limits: PlanLimits = {
      maxTasks: parseLimit(metadata.max_tasks, DEFAULT_PLAN_LIMITS[plan].maxTasks),
    }

    // Cache result
    limitsCache.set(stripePriceId, { limits, timestamp: Date.now() })

    return limits
  } catch (error) {
    console.error('Error fetching plan limits from Stripe:', error)
    // Fallback to defaults
    return DEFAULT_PLAN_LIMITS[plan]
  }
}

/**
 * Parses limit value from metadata
 * Supports: "unlimited", "infinity", or numeric string
 */
function parseLimit(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue

  const normalized = value.toLowerCase().trim()

  if (normalized === 'unlimited' || normalized === 'infinity') {
    return Infinity
  }

  const parsed = parseInt(normalized, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Clears the limits cache (useful for testing or manual refresh)
 */
export function clearLimitsCache() {
  limitsCache.clear()
}
