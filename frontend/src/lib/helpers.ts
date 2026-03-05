// helpers.js — utility functions used across the app

// Format a date for display: "04 Mar 2026"
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Format a timestamp for display: "14:32"
export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// Get the start of a period as an ISO string
// period: 'today' | 'week' | 'month' | 'all'
export function periodStart(period: string): string {
  const now = new Date()
  
  switch (period) {
    case 'today':
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return today.toISOString()
    
    case 'week':
      const dayOfWeek = now.getDay()
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const monday = new Date(now.setDate(diff))
      return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()).toISOString()
    
    case 'month':
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      return firstDay.toISOString()
    
    case 'all':
      return '2020-01-01T00:00:00.000Z' // Far past date
    
    default:
      return now.toISOString()
  }
}

// Format a number with commas: 4200 → "4,200"
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

// Safely extracts an array from an Axios response data field
// Handles both { data: [...] } and plain [...] shapes
export function extractArray<T>(responseData: unknown): T[] {
  if (!responseData) return []
  if (Array.isArray((responseData as any).data)) return (responseData as any).data
  if (Array.isArray(responseData)) return responseData as T[]
  return []
}

// Return a label for movement type
export function movementTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    opening: 'Opening Stock',
    receipt: 'Received',
    distribution: 'Distributed',
    correction: 'Correction',
    spoil: 'Spoiled'
  }
  return labels[type] || type
}

// Return a Tailwind color class for movement type
export function movementTypeColor(type: string): string {
  const colors: Record<string, string> = {
    opening: 'text-orange-500 bg-orange-50',
    receipt: 'text-green-500 bg-green-50',
    distribution: 'text-orange-500 bg-orange-50',
    correction: 'text-yellow-500 bg-yellow-50',
    spoil: 'text-red-500 bg-red-50'
  }
  return colors[type] || 'text-gray-500 bg-gray-50'
}

// Return a Tailwind color class for movement type (text only)
export function movementTypeTextColor(type: string): string {
  const colors: Record<string, string> = {
    opening: 'text-orange-500',
    receipt: 'text-green-500',
    distribution: 'text-orange-500',
    correction: 'text-yellow-500',
    spoil: 'text-red-500'
  }
  return colors[type] || 'text-gray-500'
}

// Format currency amount
export function formatCurrency(amount: number): string {
  if (amount === null || amount === undefined) return '₦0'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount)
}

// Get relative time string (e.g., "2 hours ago", "Yesterday")
export function getRelativeTime(dateStr: string): string {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return diffMinutes < 1 ? 'Just now' : `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  }
  
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }
  
  if (diffDays === 1) {
    return 'Yesterday'
  }
  
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
  
  return formatDate(dateStr)
}
