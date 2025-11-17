import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { canCreateTask, hasFeatureAccess } from '@/lib/entitlements/check'
import { PlanFeature } from '@/lib/entitlements/config'

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // 'task'
  const feature = searchParams.get('feature') as PlanFeature | null

  if (type === 'task') {
    const result = await canCreateTask(session.user.id)
    return NextResponse.json(result)
  }

  if (feature) {
    const result = await hasFeatureAccess(session.user.id, feature)
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
