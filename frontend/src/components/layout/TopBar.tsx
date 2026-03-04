// TopBar — Header with page title, date, and period toggle
// Shows on all pages at the top

'use client'

interface TopBarProps {
  title: string
  period: string
  onPeriodChange: (period: string) => void
}

export default function TopBar({ title, period, onPeriodChange }: TopBarProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'all', label: 'All' },
  ]

  return (
    <header className="sticky top-0 z-40 h-14 bg-white border-b border-gray-200">
      <div className="flex justify-between items-center h-full px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-400">{today}</p>
        </div>
        
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`text-xs font-medium rounded-full px-3 py-1 ${
                period === p.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
