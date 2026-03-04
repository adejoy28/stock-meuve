// EmptyState.tsx — Consistent empty state component with icon, title, description, and optional CTA
// Props: title (string), description (string), action? (object with label and onClick), variant? ('default' | 'success')

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'success'
}

export default function EmptyState({ 
  icon = '📋', 
  title, 
  description, 
  action, 
  variant = 'default' 
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
        variant === 'success' ? 'bg-green-100' : 'bg-gray-100'
      }`}>
        <span className={`text-2xl ${
          variant === 'success' ? 'text-green-600' : 'text-gray-400'
        }`}>{icon}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-orange-500 text-white text-sm font-medium rounded-lg h-12 px-5 w-full active:opacity-70"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
