export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Task Manager</h1>
        <p className="text-muted-foreground mb-8">
          A modern SaaS application with Stripe subscriptions
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Go to Dashboard
          </a>
          <a
            href="/auth/signin"
            className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  )
}
