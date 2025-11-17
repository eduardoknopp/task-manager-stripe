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
      'Up to 10 tasks',
      '1 project',
      'Basic features',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 5,
    interval: 'month' as const,
    priceLookupKey: env.STRIPE_PRO_PRICE_LOOKUP_KEY,
    features: [
      'Unlimited tasks',
      'Unlimited projects',
      'Task priorities',
      'Tags and labels',
      'Due dates and reminders',
      'Priority support',
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
