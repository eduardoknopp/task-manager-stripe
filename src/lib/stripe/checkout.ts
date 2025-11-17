import { stripe } from './client'
import { STRIPE_CONFIG } from './config'

export interface CreateCheckoutSessionParams {
  userId: string
  userEmail: string
  priceLookupKey?: string
}

/**
 * Validates and normalizes email address
 */
function validateEmail(email: string): string {
  const trimmed = email.trim()

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    throw new Error(`Invalid email format: ${trimmed}`)
  }

  return trimmed
}

/**
 * Resolves price lookup key to actual price ID from Stripe
 * Uses caching to avoid repeated API calls
 */
let priceCache: Map<string, { id: string; timestamp: number }> = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function resolvePriceId(lookupKey: string): Promise<string> {
  // Check cache first
  const cached = priceCache.get(lookupKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.id
  }

  // Fetch from Stripe
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
  })

  if (!prices.data.length) {
    throw new Error(`Price with lookup key "${lookupKey}" not found in Stripe`)
  }

  const priceId = prices.data[0].id

  // Cache result
  priceCache.set(lookupKey, { id: priceId, timestamp: Date.now() })

  return priceId
}

/**
 * Creates a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  priceLookupKey = STRIPE_CONFIG.proPriceLookupKey,
}: CreateCheckoutSessionParams) {
  try {
    // Validate email before sending to Stripe
    const validatedEmail = validateEmail(userEmail)

    // Resolve lookup key to price ID
    const priceId = await resolvePriceId(priceLookupKey)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
      customer_email: validatedEmail,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    })

    return { url: session.url, sessionId: session.id }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

/**
 * Creates a Stripe Customer Portal session for subscription management
 */
export async function createPortalSession(customerId: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw new Error('Failed to create portal session')
  }
}
