'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UpgradePrompt } from '@/components/entitlements'

interface CreateTaskFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateTaskForm({ onSuccess, onCancel }: CreateTaskFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [upgradeRequired, setUpgradeRequired] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as 'TODO' | 'IN_PROGRESS' | 'DONE',
    dueDate: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUpgradeRequired(false)

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403 && data.upgradeRequired) {
          setUpgradeRequired(true)
          setError(data.error)
        } else {
          setError(data.error || 'Failed to create task')
        }
        return
      }

      // Success
      setFormData({ title: '', description: '', status: 'TODO', dueDate: '' })
      router.refresh()
      onSuccess?.()
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (upgradeRequired && error) {
    return <UpgradePrompt message={error} showUpgrade={true} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && !upgradeRequired && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          required
          maxLength={200}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter task description (optional)"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-1">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !formData.title}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
