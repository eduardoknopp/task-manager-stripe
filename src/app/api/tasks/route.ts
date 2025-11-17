import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { canCreateTask, incrementTaskCount, hasFeatureAccess } from '@/lib/entitlements/check'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/tasks - List user's tasks
export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const where: any = {
    userId: session.user.id,
    deletedAt: null,
  }

  if (status) {
    where.status = status
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tasks)
}

// POST /api/tasks - Create new task
export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  // Check entitlement
  const entitlementCheck = await canCreateTask(userId)

  if (!entitlementCheck.allowed) {
    return NextResponse.json(
      {
        error: entitlementCheck.reason,
        upgradeRequired: entitlementCheck.upgradeRequired,
      },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const data = createTaskSchema.parse(body)

    // Validate PRO features
    if (data.priority) {
      const priorityAccess = await hasFeatureAccess(userId, 'taskPriority')
      if (!priorityAccess.allowed) {
        return NextResponse.json(
          { error: 'Task priorities are a PRO feature', upgradeRequired: true },
          { status: 403 }
        )
      }
    }

    if (data.tags && data.tags.length > 0) {
      const tagsAccess = await hasFeatureAccess(userId, 'taskTags')
      if (!tagsAccess.allowed) {
        return NextResponse.json(
          { error: 'Task tags are a PRO feature', upgradeRequired: true },
          { status: 403 }
        )
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        ...data,
        userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    })

    // Increment usage counter
    await incrementTaskCount(userId)

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
