import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getCurrentPeriodUsage } from '@/lib/stripe/usage'

/**
 * GET /api/billing/metered-usage
 * Returns current period metered usage (if configured)
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUsage = await getCurrentPeriodUsage(session.user.id)

    return NextResponse.json({
      currentUsage,
      isMetered: currentUsage !== null,
    })
  } catch (error) {
    console.error('Error fetching metered usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    )
  }
}
