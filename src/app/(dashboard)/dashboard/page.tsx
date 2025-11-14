import { auth } from '@/lib/auth'
import { getUserSubscription } from '@/lib/stripe/subscription'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin')
  }

  const subscription = await getUserSubscription(session.user.id)
  const plan = subscription?.plan || 'FREE'

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {session.user.name || session.user.email}!</p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-6">
          {/* Subscription Info */}
          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Your Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{plan} Plan</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan === 'FREE' ? 'Limited features' : 'All features unlocked'}
                </p>
              </div>
              {plan === 'FREE' && (
                <a
                  href="/billing"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                >
                  Upgrade to Pro
                </a>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-1">Tasks</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-1">Projects</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition text-left">
                <p className="font-medium">Create Task</p>
                <p className="text-sm text-muted-foreground">Add a new task to your list</p>
              </button>
              <button className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition text-left">
                <p className="font-medium">New Project</p>
                <p className="text-sm text-muted-foreground">Start organizing your tasks</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
