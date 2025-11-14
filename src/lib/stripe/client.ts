import Stripe from 'stripe'
import { env } from '@/lib/utils/env'

if (!env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
  appInfo: {
    name: 'Task Manager SaaS',
    version: '0.1.0',
  },
})
