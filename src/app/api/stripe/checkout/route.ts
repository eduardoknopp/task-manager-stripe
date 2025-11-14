import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession} from '@/lib/stripe/checkout'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, userEmail } = body

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { url } = await createCheckoutSession({
      userId,
      userEmail,
    })

    if (!url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
