import { auth } from '@/lib/auth'
import { getUserSubscription } from '@/lib/stripe/subscription'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { UsageDisplay } from './usage-display'

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

          {/* Usage Stats with Entitlements */}
          <UsageDisplay />

          {/* Quick Actions */}
          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="/tasks"
                className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition text-left block"
              >
                <p className="font-medium">Manage Tasks</p>
                <p className="text-sm text-muted-foreground">View and create tasks</p>
              </a>
              <a
                href="/billing"
                className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition text-left block"
              >
                <p className="font-medium">Upgrade Plan</p>
                <p className="text-sm text-muted-foreground">Unlock all features</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
