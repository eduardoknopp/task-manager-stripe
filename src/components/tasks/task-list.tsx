'use client'

import { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { useRouter } from 'next/navigation'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | null
  tags: string[]
  dueDate: string | null
  createdAt: string
  project: {
    id: string
    name: string
    color: string | null
  } | null
}

export interface TaskListRef {
  refetch: () => void
}

interface TaskListProps {
  onTaskChange?: () => void
}

export const TaskList = forwardRef<TaskListRef, TaskListProps>(function TaskList({ onTaskChange }, ref) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL')

  async function fetchTasks() {
    try {
      const url = filter === 'ALL'
        ? '/api/tasks'
        : `/api/tasks?status=${filter}`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filter])

  useImperativeHandle(ref, () => ({
    refetch: fetchTasks
  }))

  async function deleteTask(id: string) {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== id))
        router.refresh()
        onTaskChange?.()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  async function toggleStatus(task: Task) {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE'

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchTasks()
        router.refresh()
        onTaskChange?.()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-700'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700'
      case 'DONE': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-blue-100 text-blue-700'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700'
      case 'HIGH': return 'bg-orange-100 text-orange-700'
      case 'URGENT': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100'
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg border-dashed">
          <p className="text-muted-foreground">No tasks yet. Create your first task!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border border-border rounded-lg p-4 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.status === 'DONE'}
                  onChange={() => toggleStatus(task)}
                  className="mt-1 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <h3 className={`font-medium ${task.status === 'DONE' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.priority && (
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    )}
                    {task.tags && task.tags.length > 0 && task.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                        #{tag}
                      </span>
                    ))}
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
