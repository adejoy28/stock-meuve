// LayoutWrapper — Client component that wraps pages with layout components
// This allows us to use hooks (useStock) in the layout

'use client'

import { usePathname } from 'next/navigation'
import { useStock } from '@/context/StockContext'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import QuickActions from './QuickActions'
import OpeningStockModal from '@/components/modals/OpeningStockModal'
import ReceiveGoodsModal from '@/components/modals/ReceiveGoodsModal'
import DistributeModal from '@/components/modals/DistributeModal'
import RecordSpoilModal from '@/components/modals/RecordSpoilModal'
import CorrectionModal from '@/components/modals/CorrectionModal'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const { period, setPeriod, handleQuickAction, pendingSpoilsCount } = useStock()

  // Get page title based on current path
  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return 'Dashboard'
      case '/products':
        return 'Products'
      case '/shops':
        return 'Shops'
      case '/movements':
        return 'Movements'
      case '/spoils':
        return 'Spoils Queue'
      case '/reports':
        return 'Reports'
      default:
        return 'Stockmeuve'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBar 
        title={getPageTitle()}
        period={period}
        onPeriodChange={setPeriod}
      />
      <main className="px-4 pt-4 pb-24">
        {children}
      </main>
      <BottomNav pendingSpoilsCount={pendingSpoilsCount} />
      <QuickActions onAction={handleQuickAction} />
      
      {/* Modals */}
      <OpeningStockModal />
      <ReceiveGoodsModal />
      <DistributeModal />
      <RecordSpoilModal />
      <CorrectionModal />
    </div>
  )
}
