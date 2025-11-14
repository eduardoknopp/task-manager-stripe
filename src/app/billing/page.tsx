'use client'

import { useState } from 'react'

export default function BillingPage() {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)

    try {
      // TODO: Get real user data from session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id',
          userEmail: 'test@example.com',
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert(`Error: ${error}`)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">Choose Your Plan</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">Free</h2>
            <p className="text-3xl font-bold mb-4">
              $0<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Up to 10 tasks</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>1 project</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Basic features</span>
              </li>
            </ul>
            <button
              disabled
              className="w-full px-6 py-3 border border-border rounded-lg opacity-50 cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-primary rounded-lg p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
              Popular
            </div>
            <h2 className="text-2xl font-bold mb-2">Pro</h2>
            <p className="text-3xl font-bold mb-4">
              $5<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Unlimited tasks</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Unlimited projects</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Task priorities</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Tags and labels</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Due dates & reminders</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
