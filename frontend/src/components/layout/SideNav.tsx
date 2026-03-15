'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SideNavProps {
  onAction: (actionId: string) => void
  pendingSpoilsCount: number
  onCollapseChange?: (isCollapsed: boolean) => void
}

export default function SideNav({ onAction, pendingSpoilsCount, onCollapseChange }: SideNavProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapseChange?.(newCollapsed)
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Products', href: '/products', icon: '📦' },
    { name: 'Movements', href: '/movements', icon: '🔄' },
    { name: 'Spoils Queue', href: '/spoils', icon: '⚠️', badge: pendingSpoilsCount },
    { name: 'Reports', href: '/reports', icon: '📈' },
    { name: 'Shops', href: '/shops', icon: '🏪' },
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'About', href: '/about', icon: 'ℹ️' },
  ]

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-56'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header with Logo and Toggle */}
        <div className="flex items-center h-16 bg-orange-500 px-2">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
            <span className="text-white text-xl font-bold">C</span>
          </div>
          {!isCollapsed && (
            <span className="ml-3 text-white font-semibold">Charly HB</span>
          )}
          <button
            onClick={toggleCollapse}
            className="ml-auto p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const hasBadge = item.badge && item.badge > 0

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="ml-3">{item.name}</span>
                    {/* Badge for pending spoils */}
                    {hasBadge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                
                {/* Badge for collapsed state */}
                {isCollapsed && hasBadge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="px-2 py-4 border-t border-gray-200">
          <button
            onClick={() => onAction('receive-goods')}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
            title={isCollapsed ? 'Quick Actions' : undefined}
          >
            <span className="text-xl shrink-0">⚡</span>
            {!isCollapsed && <span className="ml-3">Quick Actions</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
