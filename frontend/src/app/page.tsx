// page.tsx — Dashboard page showing stock overview and quick actions
// Displays today's summary, pending spoils, and quick action buttons for stock operations

'use client'

import { useStock } from '@/context/StockContext'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'

export default function Home() {
  const { 
    period, 
    setPeriod, 
    handleQuickAction, 
    reportSummary,
    loading,
    products,
    pendingSpoilsCount
  } = useStock()

  if (loading) {
    return <LoadingSkeleton type="dashboard" />
  }

  return (
    <div className="px-4 py-4 space-y-6 pb-20">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Dashboard Overview</h3>
        <p className="text-sm text-gray-700">Welcome to StockFlow - your stock management system.</p>
        <p className="text-xs text-gray-400 mt-2">Current period: {period}</p>
        {pendingSpoilsCount > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-500 text-sm">
              {pendingSpoilsCount} pending spoil{pendingSpoilsCount > 1 ? 's' : ''} awaiting review
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">
            {reportSummary?.total_opening || 0}
          </div>
          <div className="text-sm text-gray-600">Opening Stock</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">
            {reportSummary?.total_received || 0}
          </div>
          <div className="text-sm text-gray-600">Received</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-500">
            {reportSummary?.total_distributed || 0}
          </div>
          <div className="text-sm text-gray-600">Distributed</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-500">
            {reportSummary?.total_spoiled || 0}
          </div>
          <div className="text-sm text-gray-600">Spoiled</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickAction('opening')}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:opacity-70 text-left"
          >
            <span className="block font-medium text-gray-900">Opening Stock</span>
            <span className="text-xs text-gray-500">Set daily opening balances</span>
          </button>
          <button
            onClick={() => handleQuickAction('receipt')}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:opacity-70 text-left"
          >
            <span className="block font-medium text-gray-900">Receive Goods</span>
            <span className="text-xs text-gray-500">Record warehouse receipt</span>
          </button>
          <button
            onClick={() => handleQuickAction('distribution')}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:opacity-70 text-left"
          >
            <span className="block font-medium text-gray-900">Distribute</span>
            <span className="text-xs text-gray-500">Deliver to shops</span>
          </button>
          <button
            onClick={() => handleQuickAction('spoil')}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 active:opacity-70 text-left"
          >
            <span className="block font-medium text-gray-900">Record Spoil</span>
            <span className="text-xs text-gray-500">Log damaged/expired items</span>
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first product to get started with stock management</p>
          <button
            onClick={() => handleQuickAction('opening')}
            className="bg-orange-500 text-white text-sm font-medium rounded-lg h-12 px-5 w-full active:opacity-70"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Current Stock Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                <div className="text-xs text-gray-400">{product.sku_code}</div>
                <div className={`mt-2 text-2xl font-bold ${
                  product.balance === 0 ? 'text-red-500' : 
                  product.balance <= 5 ? 'text-orange-500' : 'text-green-600'
                }`}>
                  {product.balance} units
                </div>
              </div>
            ))}
          </div>
          {products.length > 6 && (
            <p className="text-xs text-gray-400 mt-4">
              Showing 6 of {products.length} products. View all on Products page.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
