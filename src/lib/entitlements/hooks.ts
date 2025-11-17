'use client'

import { useEffect, useState } from 'react'
import { PlanFeature } from './config'
import type { UsageStats, EntitlementResult } from './check'

/**
 * Hook to get usage statistics
 */
export function useUsageStats() {
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/entitlements/usage')
      .then((res) => res.json())
      .then((data) => setUsage(data))
      .catch(() => setUsage(null))
      .finally(() => setLoading(false))
  }, [])

  return { usage, loading }
}

/**
 * Hook to check if user can create tasks
 */
export function useCanCreateTask() {
  const [result, setResult] = useState<EntitlementResult>({ allowed: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/entitlements/check?type=task')
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch(() => setResult({ allowed: false }))
      .finally(() => setLoading(false))
  }, [])

  return { ...result, loading }
}

/**
 * Hook to check if user can create projects
 */
export function useCanCreateProject() {
  const [result, setResult] = useState<EntitlementResult>({ allowed: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/entitlements/check?type=project')
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch(() => setResult({ allowed: false }))
      .finally(() => setLoading(false))
  }, [])

  return { ...result, loading }
}

/**
 * Hook to check feature access
 */
export function useFeatureAccess(feature: PlanFeature) {
  const [result, setResult] = useState<EntitlementResult>({ allowed: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/entitlements/check?feature=${feature}`)
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch(() => setResult({ allowed: false }))
      .finally(() => setLoading(false))
  }, [feature])

  return { ...result, loading }
}
