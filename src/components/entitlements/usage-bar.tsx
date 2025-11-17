'use client'

interface UsageBarProps {
  current: number
  max: number
  label: string
  type?: 'tasks'
}

export function UsageBar({ current, max, label }: UsageBarProps) {
  const percentage = max === Infinity ? 0 : Math.min((current / max) * 100, 100)
  const isNearLimit = percentage >= 80 && percentage < 100
  const isAtLimit = percentage >= 100

  const barColor = isAtLimit
    ? 'bg-red-500'
    : isNearLimit
      ? 'bg-amber-500'
      : 'bg-blue-500'

  const textColor = isAtLimit
    ? 'text-red-600'
    : isNearLimit
      ? 'text-amber-600'
      : 'text-gray-600'

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-semibold ${textColor}`}>
          {current} / {max === Infinity ? '∞' : max}
        </span>
      </div>
      {max !== Infinity && (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
