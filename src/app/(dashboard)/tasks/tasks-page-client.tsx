'use client'

import { useRef } from 'react'
import { CreateTaskForm } from '@/components/tasks/create-task-form'
import { TaskList, TaskListRef } from '@/components/tasks/task-list'
import { UsageDisplay, UsageDisplayRef } from '../dashboard/usage-display'

export function TasksPageClient() {
  const taskListRef = useRef<TaskListRef>(null)
  const usageDisplayRef = useRef<UsageDisplayRef>(null)

  const handleTaskChange = () => {
    usageDisplayRef.current?.refetch()
  }

  const handleTaskCreated = () => {
    taskListRef.current?.refetch()
    usageDisplayRef.current?.refetch()
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Create Task Form */}
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Create New Task</h2>
          <CreateTaskForm onSuccess={handleTaskCreated} />
        </div>

        {/* Task List */}
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Your Tasks</h2>
          <TaskList ref={taskListRef} onTaskChange={handleTaskChange} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Usage Display */}
        <UsageDisplay ref={usageDisplayRef} />

        {/* Quick Links */}
        <div className="border border-border rounded-lg p-6">
          <h3 className="font-bold mb-4">Quick Links</h3>
          <div className="space-y-2">
            <a
              href="/dashboard"
              className="block px-4 py-2 rounded-lg hover:bg-accent transition text-sm"
            >
              Dashboard
            </a>
            <a
              href="/billing"
              className="block px-4 py-2 rounded-lg hover:bg-accent transition text-sm"
            >
              Billing & Upgrade
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
