'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface SideNavProps {
  onAction: (actionId: string) => void
  pendingSpoilsCount?: number
  onCollapseChange?: (collapsed: boolean) => void
}

// ── Navigation pages ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    href: '/',
    label: 'Dashboard',
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
    href: '/shops',
    label: 'Shops',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: '/spoils',
    label: 'Spoils',
    badge: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

// ── Record actions (open modals) ──────────────────────────────────────────────
const RECORD_ACTIONS = [
  { id: 'opening',      label: 'Opening Stock',  color: 'text-gray-600' },
  { id: 'receipt',      label: 'Receive Goods',  color: 'text-green-600' },
  { id: 'distribution', label: 'Distribute',     color: 'text-orange-500' },
  { id: 'spoil',        label: 'Record Spoil',   color: 'text-red-500' },
  { id: 'correction',   label: 'Correction',     color: 'text-purple-500' },
]

export default function SideNav({
  onAction,
  pendingSpoilsCount = 0,
  onCollapseChange,
}: SideNavProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    onCollapseChange?.(next)
  }

  // Normalise pathname — strip trailing slash
  const normPath = pathname.replace(/\/$/, '') || '/'

  return (
    // Hidden on mobile. Tablet: always 64px (icon only). Desktop: collapsible.
    <aside
      className={`
        hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40
        bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        w-16
        ${collapsed ? 'lg:w-16' : 'lg:w-56'}
      `}
    >

      {/* ── Header: logo + app name + collapse toggle ── */}
      <div className="flex items-center h-14 border-b border-gray-100 px-3 shrink-0">
        {/* Logo */}
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">C</span>
        </div>

        {/* App name — desktop expanded only */}
        <span className={`
          hidden lg:block ml-2.5 text-sm font-bold text-gray-900 tracking-tight truncate flex-1
          transition-opacity duration-200
          ${collapsed ? 'lg:hidden' : ''}
        `}>
          Charly HB
        </span>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={toggle}
          className={`
            hidden lg:flex items-center justify-center w-6 h-6 rounded-md
            text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:opacity-70
            shrink-0 transition-colors
            ${collapsed ? 'mx-auto' : 'ml-auto'}
          `}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* ── Navigation items ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">

        {/* Section label — desktop expanded */}
        {!collapsed && (
          <p className="hidden lg:block text-xs font-medium text-gray-400 uppercase tracking-wide px-2 pb-1.5">
            Navigate
          </p>
        )}

        {NAV_ITEMS.map(item => {
          const isActive = normPath === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`
                group flex items-center gap-3 px-2 py-2.5 rounded-xl
                transition-colors duration-150 relative
                ${isActive
                  ? 'bg-orange-50 text-orange-500'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }
              `}
            >
              {/* Icon */}
              <div className="relative shrink-0">
                {item.icon}
                {/* Badge dot — always visible */}
                {item.badge && pendingSpoilsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>

              {/* Label — desktop expanded */}
              {!collapsed && (
                <span className="hidden lg:block text-sm font-medium truncate">
                  {item.label}
                </span>
              )}

              {/* Badge count — desktop expanded */}
              {!collapsed && item.badge && pendingSpoilsCount > 0 && (
                <span className="hidden lg:flex ml-auto text-xs bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center shrink-0">
                  {pendingSpoilsCount > 9 ? '9+' : pendingSpoilsCount}
                </span>
              )}

              {/* Tooltip — collapsed state only */}
              {collapsed && (
                <div className="
                  absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs
                  rounded-md whitespace-nowrap pointer-events-none
                  opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50
                ">
                  {item.label}
                  {item.badge && pendingSpoilsCount > 0 && (
                    <span className="ml-1 text-red-300">({pendingSpoilsCount})</span>
                  )}
                </div>
              )}
            </Link>
          )
        })}

        {/* ── Record actions — desktop expanded only ── */}
        {!collapsed && (
          <div className="hidden lg:block pt-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 pb-1.5">
              Record
            </p>
            {RECORD_ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 active:opacity-70 text-left transition-colors"
              >
                <span className={`text-base font-bold leading-none ${action.color}`}>+</span>
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Record FAB — collapsed desktop + tablet (icon only) */}
        {collapsed && (
          <div className="hidden lg:flex justify-center pt-2">
            <button
              onClick={() => onAction('distribution')}
              title="Record Distribution"
              className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 active:opacity-70 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}

        {/* Record FAB — tablet (always icon only, md breakpoint) */}
        <div className="md:flex lg:hidden justify-center pt-2">
          <button
            onClick={() => onAction('distribution')}
            title="Distribute"
            className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center active:opacity-70"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

      </nav>

      {/* ── User profile footer ── */}
      <div className="border-t border-gray-100 p-2 shrink-0">
        <Link
          href="/profile"
          title="Profile"
          className={`
            group flex items-center gap-3 px-2 py-2.5 rounded-xl
            transition-colors hover:bg-gray-50 active:opacity-70
            ${normPath === '/profile' ? 'bg-orange-50 text-orange-500' : 'text-gray-500'}
          `}
        >
          {/* Avatar circle with first letter */}
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-gray-600">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          {/* Name + email — expanded desktop */}
          {!collapsed && (
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || user?.username || user?.phone || 'Profile'}
              </p>
            </div>
          )}

          {/* Tooltip for collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              {user?.name || 'Profile'}
            </div>
          )}
        </Link>
      </div>

    </aside>
  )
}
