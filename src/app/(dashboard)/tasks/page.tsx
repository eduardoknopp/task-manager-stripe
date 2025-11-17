import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { CreateTaskForm } from '@/components/tasks/create-task-form'
import { TaskList } from '@/components/tasks/task-list'
import { UsageDisplay } from '../dashboard/usage-display'

export default async function TasksPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks and track progress</p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Task Form */}
            <div className="border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Create New Task</h2>
              <CreateTaskForm />
            </div>

            {/* Task List */}
            <div className="border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Your Tasks</h2>
              <TaskList />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Display */}
            <UsageDisplay />

            {/* Quick Stats */}
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
      </div>
    </main>
  )
}
