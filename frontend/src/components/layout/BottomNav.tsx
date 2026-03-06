// BottomNav — Fixed bottom navigation bar with 5 tabs
// Shows on all pages, mobile-first design that stays on desktop too

'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface BottomNavProps {
  pendingSpoilsCount?: number
}

export default function BottomNav({ pendingSpoilsCount = 0 }: BottomNavProps) {
  const pathname = usePathname()

  const tabs = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/products', label: 'Products', icon: '📦' },
    { href: '/shops', label: 'Shops', icon: '🏪' },
    { href: '/movements', label: 'Movements', icon: '📋' },
    { href: '/spoils', label: 'Spoils', icon: '⚠️', badge: pendingSpoilsCount > 0 },
    { href: '/reports', label: 'Reports', icon: '📈' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex justify-around py-2 pb-safe">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg min-h-[56px] relative ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
              {tab.badge && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
