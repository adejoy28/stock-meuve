// TypeBadge.tsx — Colored pill badge for movement type
// Props: type (string) - one of: opening, receipt, distribution, correction, spoil

interface TypeBadgeProps {
  type: 'opening' | 'receipt' | 'distribution' | 'correction' | 'spoil'
}

export default function TypeBadge({ type }: TypeBadgeProps) {
  const getBadgeConfig = (type: TypeBadgeProps['type']) => {
    const configs = {
      opening: {
        label: 'Opening',
        classes: 'inline-flex items-center bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full'
      },
      receipt: {
        label: 'Received',
        classes: 'inline-flex items-center bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full'
      },
      distribution: {
        label: 'Distributed',
        classes: 'inline-flex items-center bg-orange-50 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full'
      },
      correction: {
        label: 'Correction',
        classes: 'inline-flex items-center bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full'
      },
      spoil: {
        label: 'Spoil',
        classes: 'inline-flex items-center bg-red-50 text-red-500 text-xs font-medium px-2 py-0.5 rounded-full'
      }
    }
    return configs[type] || { label: type, classes: 'inline-flex items-center bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full' }
  }

  const config = getBadgeConfig(type)

  return (
    <span className={config.classes}>
      {config.label}
    </span>
  )
}
