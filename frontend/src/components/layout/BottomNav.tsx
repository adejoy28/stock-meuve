// BottomNav — Fixed bottom navigation with 4 primary tabs + More sheet
// More sheet contains Shops and Reports

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import MoreSheet from './MoreSheet'

interface BottomNavProps {
  pendingSpoilsCount?: number
}

export default function BottomNav({ pendingSpoilsCount = 0 }: BottomNavProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  // Pages that live inside the More sheet
  const morePages = ['/shops', '/reports']
  const moreIsActive = morePages.includes(pathname)

  const tabs = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/movements',
      label: 'Movements',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      href: '/products',
      label: 'Products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      href: '/spoils',
      label: 'Spoils',
      badge: pendingSpoilsCount > 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-1">

          {/* Primary tabs */}
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center py-2 px-2 flex-1 relative ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.badge && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                <span className="text-xs mt-0.5 truncate w-full text-center">{tab.label}</span>
              </Link>
            )
          })}

          {/* More tab */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-2 px-2 flex-1 ${
              moreIsActive ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs mt-0.5">More</span>
          </button>

        </div>
      </nav>

      {/* More sheet */}
      <MoreSheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  )
}
