'use client'

import { useEffect, useState } from 'react'

interface MeteredUsage {
  currentUsage: number | null
  isMetered: boolean
}

/**
 * Displays current period metered usage (if metered billing is configured)
 * Optional component - only shows if user has metered subscription
 */
export function MeteredUsageDisplay() {
  const [usage, setUsage] = useState<MeteredUsage>({
    currentUsage: null,
    isMetered: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch('/api/billing/metered-usage')
        if (response.ok) {
          const data = await response.json()
          setUsage(data)
        }
      } catch (error) {
        console.error('Error fetching metered usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [])

  // Don't render if not metered or loading
  if (loading || !usage.isMetered || usage.currentUsage === null) {
    return null
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-900">
        Usage This Period
      </h3>
      <p className="mt-2 text-2xl font-semibold text-gray-700">
        {usage.currentUsage} tasks
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Billed at end of period based on total usage
      </p>
    </div>
  )
}
