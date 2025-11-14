'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition text-sm"
    >
      Sign Out
    </button>
  )
}
