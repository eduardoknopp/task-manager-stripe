import { env } from '@/lib/utils/env'

export const STRIPE_CONFIG = {
  publishableKey: env.STRIPE_PUBLISHABLE_KEY,
  proPriceLookupKey: env.STRIPE_PRO_PRICE_LOOKUP_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
} as const

export const STRIPE_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    interval: null,
    features: [
      'Up to 2 tasks',
      'Basic features',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 5,
    interval: 'month' as const,
    priceLookupKey: env.STRIPE_PRO_PRICE_LOOKUP_KEY,
    features: [
      '10 tasks included',
      '$0.10 per extra task',
      'Task priorities',
      'Tags and labels',
    ],
  },
} as const

export const STRIPE_WEBHOOK_EVENTS = {
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  PAYMENT_FAILED: 'invoice.payment_failed',
} as const
