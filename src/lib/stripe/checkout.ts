import { stripe } from './client'
import { STRIPE_CONFIG } from './config'

export interface CreateCheckoutSessionParams {
  userId: string
  userEmail: string
  priceId?: string
}

/**
 * Creates a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  priceId = STRIPE_CONFIG.proPriceId,
}: CreateCheckoutSessionParams) {
  try {
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
      customer_email: userEmail,
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
    throw new Error('Failed to create checkout session')
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
