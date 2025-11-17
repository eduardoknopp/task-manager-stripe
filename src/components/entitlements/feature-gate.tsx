'use client'

import { ReactNode } from 'react'
import { useFeatureAccess } from '@/lib/entitlements/hooks'
import { PlanFeature } from '@/lib/entitlements/config'
import { UpgradePrompt } from './upgrade-prompt'

interface FeatureGateProps {
  feature: PlanFeature
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Component that shows children only if user has feature access
 * Shows upgrade prompt if access denied
 *
 * Usage:
 * <FeatureGate feature="taskPriority">
 *   <PrioritySelector />
 * </FeatureGate>
 */
export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { allowed, loading, reason, upgradeRequired } = useFeatureAccess(feature)

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-10 rounded-lg" />
    )
  }

  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (upgradeRequired && reason) {
      return <UpgradePrompt message={reason} />
    }

    return null
  }

  return <>{children}</>
}
