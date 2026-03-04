// StatCard.tsx — A single summary stat card following design checklist
// Props: label (string), value (number), color ('gray' | 'green' | 'orange' | 'red')

interface StatCardProps {
  label: string
  value: number
  color?: 'gray' | 'green' | 'orange' | 'red'
}

export default function StatCard({ label, value, color = 'gray' }: StatCardProps) {
  const getColorClasses = (color: 'gray' | 'green' | 'orange' | 'red') => {
    const colors: Record<'gray' | 'green' | 'orange' | 'red', string> = {
      gray: 'text-gray-900',
      green: 'text-green-600',
      orange: 'text-orange-500',
      red: 'text-red-500'
    }
    return colors[color]
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className={`text-2xl font-bold ${getColorClasses(color)}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}
