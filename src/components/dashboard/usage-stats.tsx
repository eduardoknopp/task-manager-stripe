'use client'

import { useEffect, useState } from 'react'

interface UsageData {
  taskCount: number
  maxTasks: number
  plan: string
  isOverage: boolean
  overageCount: number
}

/**
 * Displays task usage with overage warning for PRO users
 * FREE: Shows hard limit (2/2)
 * PRO: Shows included limit + overage (12/10 + 2 extra)
 */
export function UsageStats() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch('/api/entitlements/usage')
        if (response.ok) {
          const data = await response.json()

          const isOverage = data.plan === 'PRO' && data.taskCount > data.maxTasks
          const overageCount = isOverage ? data.taskCount - data.maxTasks : 0

          setUsage({
            ...data,
            isOverage,
            overageCount,
          })
        }
      } catch (error) {
        console.error('Error fetching usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [])

  if (loading || !usage) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    )
  }

  const percentage = (usage.taskCount / usage.maxTasks) * 100
  const isNearLimit = percentage >= 80 && !usage.isOverage

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">Task Usage</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          usage.plan === 'PRO'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {usage.plan}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-semibold text-gray-900">
            {usage.taskCount}
          </span>
          <span className="text-sm text-gray-500">
            / {usage.maxTasks} included
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${
              usage.isOverage
                ? 'bg-orange-500'
                : isNearLimit
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status Messages */}
      {usage.plan === 'FREE' && usage.taskCount >= usage.maxTasks && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
          <strong>Limit reached.</strong> Upgrade to PRO for unlimited tasks.
        </div>
      )}

      {usage.plan === 'PRO' && isNearLimit && !usage.isOverage && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <strong>Near limit.</strong> You have {usage.maxTasks - usage.taskCount} tasks remaining.
        </div>
      )}

      {usage.isOverage && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
          <strong>Overage:</strong> +{usage.overageCount} extra tasks this month.<br />
          <span className="text-orange-600">
            Billed at $0.10/task (${(usage.overageCount * 0.10).toFixed(2)} total)
          </span>
        </div>
      )}

      {usage.plan === 'PRO' && !usage.isOverage && (
        <p className="mt-3 text-xs text-gray-500">
          Extra tasks beyond {usage.maxTasks} are billed at $0.10 each.
        </p>
      )}
    </div>
  )
}
