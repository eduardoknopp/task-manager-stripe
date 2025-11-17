'use client'

import Link from 'next/link'

interface UpgradePromptProps {
  message: string
  showUpgrade?: boolean
}

export function UpgradePrompt({ message, showUpgrade = true }: UpgradePromptProps) {
  return (
    <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-amber-600">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">Reached Limit</h3>
          <p className="text-sm text-amber-700 mt-1">{message}</p>
          {showUpgrade && (
            <Link
              href="/billing"
              className="inline-block mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
