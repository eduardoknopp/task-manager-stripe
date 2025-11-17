'use client'

import { useUsageStats } from '@/lib/entitlements/hooks'
import { UsageBar } from '@/components/entitlements'
import { forwardRef, useImperativeHandle } from 'react'

export interface UsageDisplayRef {
  refetch: () => void
}

export const UsageDisplay = forwardRef<UsageDisplayRef>(function UsageDisplay(props, ref) {
  const { usage, loading, refetch } = useUsageStats()

  useImperativeHandle(ref, () => ({
    refetch
  }))

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Usage</h2>
        <div className="space-y-4">
          <div className="animate-pulse bg-gray-200 h-12 rounded" />
          <div className="animate-pulse bg-gray-200 h-12 rounded" />
        </div>
      </div>
    )
  }

  if (!usage) {
    return null
  }

  return (
    <div className="border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{usage.plan} Plan Usage</h2>
      <div className="space-y-4">
        <UsageBar
          current={usage.taskCount}
          max={usage.maxTasks}
          label="Tasks"
          type="tasks"
        />
      </div>
    </div>
  )
})
