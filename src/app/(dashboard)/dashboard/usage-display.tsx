'use client'

import { useUsageStats } from '@/lib/entitlements/hooks'
import { UsageBar } from '@/components/entitlements'

export function UsageDisplay() {
  const { usage, loading } = useUsageStats()

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
      <h2 className="text-xl font-bold mb-4">Uso do Plano {usage.plan}</h2>
      <div className="space-y-4">
        <UsageBar
          current={usage.taskCount}
          max={usage.maxTasks}
          label="Tarefas"
          type="tasks"
        />
        <UsageBar
          current={usage.projectCount}
          max={usage.maxProjects}
          label="Projetos"
          type="projects"
        />
      </div>
    </div>
  )
}
