import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserUsage } from '@/lib/entitlements/check'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const usage = await getUserUsage(session.user.id)

  if (!usage) {
    return NextResponse.json({ error: 'Usage data not found' }, { status: 404 })
  }

  return NextResponse.json(usage)
}
