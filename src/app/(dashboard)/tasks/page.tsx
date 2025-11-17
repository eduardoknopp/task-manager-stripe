import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { TasksPageClient } from './tasks-page-client'

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

        <TasksPageClient />
      </div>
    </main>
  )
}
