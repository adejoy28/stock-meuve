'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useStock } from '@/context/StockContext'
import { useAuth } from '@/context/AuthContext'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import SideNav from './SideNav'
import QuickActions from './QuickActions'
import AuthGuard from './AuthGuard'
import OpeningStockModal from '@/components/modals/OpeningStockModal'
import ReceiveGoodsModal from '@/components/modals/ReceiveGoodsModal'
import DistributeModal from '@/components/modals/DistributeModal'
import RecordSpoilModal from '@/components/modals/RecordSpoilModal'
import CorrectionModal from '@/components/modals/CorrectionModal'

interface LayoutWrapperProps {
  children: React.ReactNode
}

// Pages that should NOT show the nav/header
const PUBLIC_ROUTES = ['/login', '/register', '/login/', '/register/']

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const { period, setPeriod, handleQuickAction, pendingSpoilsCount } = useStock()
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false)

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || PUBLIC_ROUTES.includes(pathname.replace(/\/$/, ''))

  const handleSideNavCollapseChange = (collapsed: boolean) => {
    setIsSideNavCollapsed(collapsed)
  }

  const getPageTitle = () => {
    switch (pathname) {
      case '/':           return 'Dashboard'
      case '/products':   return 'Products'
      case '/movements':  return 'Movements'
      case '/spoils':     return 'Spoils Queue'
      case '/reports':    return 'Reports'
      case '/shops':      return 'Shops'
      case '/profile':    return 'Profile'
      case '/about':      return 'About'
      default:            return 'Charly HB'
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">

        {/* SideNav — only on authenticated pages, desktop */}
        {!isPublicRoute && (
          <SideNav
            onAction={handleQuickAction}
            pendingSpoilsCount={pendingSpoilsCount}
            onCollapseChange={handleSideNavCollapseChange}
          />
        )}

        {/* Main content area */}
        <div className={
          !isPublicRoute 
            ? `${isSideNavCollapsed ? 'lg:ml-16' : 'lg:ml-56'} min-h-screen flex flex-col transition-all duration-300` 
            : 'min-h-screen flex flex-col'
        }>

          {/* TopBar — only on authenticated pages */}
          {!isPublicRoute && (
            <TopBar
              title={getPageTitle()}
              period={period}
              onPeriodChange={setPeriod}
            />
          )}

          {/* Page content */}
          <main className={
            isPublicRoute
              ? 'min-h-screen'
              : 'flex-1 px-4 pt-4 pb-24 md:pb-8 md:px-6 lg:px-8'
          }>
            {isPublicRoute ? (
              children
            ) : (
              <div className="max-w-5xl mx-auto w-full">
                {children}
              </div>
            )}
          </main>

        </div>

        {/* Bottom nav + FAB — mobile only, authenticated pages only */}
        {!isPublicRoute && (
          <div className="md:hidden">
            <BottomNav pendingSpoilsCount={pendingSpoilsCount} />
            <QuickActions onAction={handleQuickAction} />
          </div>
        )}

        {/* Modals — only mount when authenticated */}
        {!isPublicRoute && (
          <>
            <OpeningStockModal />
            <ReceiveGoodsModal />
            <DistributeModal />
            <RecordSpoilModal />
            <CorrectionModal />
          </>
        )}

      </div>
    </AuthGuard>
  )
}
