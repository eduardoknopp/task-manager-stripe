import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { SubscriptionPlan } from '@prisma/client'

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      password: true,
    },
  })

  return user
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
    },
  })

  return user
}

/**
 * Create new user
 */
export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })

  // Create default Free subscription
  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: SubscriptionPlan.FREE,
      status: 'ACTIVE',
    },
  })

  // Create entitlement usage tracker
  await prisma.entitlementUsage.create({
    data: {
      userId: user.id,
      taskCount: 0,
      projectCount: 0,
    },
  })

  return user
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  return !!user
}
