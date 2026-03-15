// MoreSheet.tsx — Bottom sheet opened by the "More" tab in BottomNav
// Shows Shops and Reports as full-width list items

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MoreSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function MoreSheet({ isOpen, onClose }: MoreSheetProps) {
  const pathname = usePathname()

  const items = [
    {
      href: '/shops',
      label: 'Shops',
      description: 'Manage delivery destinations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      href: '/reports',
      label: 'Reports',
      description: 'View period summaries and breakdowns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: '/profile',
      label: 'Profile',
      description: 'Update your account details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

        {/* Title */}
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-4 pb-2">
          More
        </p>

        {/* Items */}
        <div className="pb-8">
          {items.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-4 active:bg-gray-50 ${
                  index < items.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                {/* Icon container */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.icon}
                </div>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-orange-500' : 'text-gray-900'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                </div>

                {/* Chevron */}
                <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
