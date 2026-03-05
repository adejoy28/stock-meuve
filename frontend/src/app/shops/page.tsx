// shops/page.tsx — Manage delivery destinations and view per-shop history
// Grid of shop cards with delivery stats and management actions

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { createShop, archiveShop } from '@/lib/api'
import { getMovements } from '@/lib/api'
import { formatDate, formatNumber, extractArray } from '@/lib/helpers'
import { ApiErrorHandler } from '@/lib/errorHandler'
import type { Shop, Movement } from '@/types'


interface ShopMovements {
  [key: number]: Movement[]
}

export default function ShopsPage() {
  const { shops, refreshShops } = useStock()
  const [showArchived, setShowArchived] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newShopName, setNewShopName] = useState('')
  const [loading, setLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [confirmArchive, setConfirmArchive] = useState<number | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)
  const [expandedShop, setExpandedShop] = useState<number | null>(null)
  const [shopMovements, setShopMovements] = useState<ShopMovements>({})

  // Filter shops based on archived status - add safety check
  const filteredShops = Array.isArray(shops) ? shops.filter((shop: Shop) => 
    showArchived ? true : !shop.archived
  ) : []

  const handleAddShop = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShopName.trim()) return

    setCreateError(null)
    setLoading(true)
    try {
      await createShop({ name: newShopName.trim() })
      await refreshShops()
      setNewShopName('')
      setShowAddForm(false)
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      
      if (ApiErrorHandler.isValidationError(apiError)) {
        setCreateError(apiError.message)
      } else if (ApiErrorHandler.isNetworkError(apiError)) {
        setCreateError('Cannot connect to server. Please check your internet connection.')
      } else {
        setCreateError('Failed to create shop. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveShop = async (shop: Shop) => {
    setArchiveError(null)
    
    try {
      await archiveShop(shop.id)
      await refreshShops()
      setConfirmArchive(null)
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      
      if (ApiErrorHandler.isConflictError(apiError)) {
        setArchiveError('Cannot archive shop - it may be in use.')
      } else if (ApiErrorHandler.isNetworkError(apiError)) {
        setArchiveError('Cannot connect to server. Please check your internet connection.')
      } else {
        setArchiveError('Failed to archive shop. Please try again.')
      }
    }
  }

  const loadShopMovements = async (shopId: number) => {
    if (shopMovements[shopId]) {
      // Toggle if already loaded
      setExpandedShop(expandedShop === shopId ? null : shopId)
      return
    }

    try {
      const response = await getMovements({ shop_id: shopId })
      
      setShopMovements(prev => ({
        ...prev,
        [shopId]: extractArray<Movement>(response.data)
      }))
      setExpandedShop(shopId)
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      console.error('Failed to load shop movements:', apiError)
    }
  }

  const ShopCard = ({ shop }: { shop: Shop }) => {
    const isExpanded = expandedShop === shop.id
    const movements = shopMovements[shop.id] || []

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
              {shop.archived && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                  Archived
                </span>
              )}
            </div>
            {!shop.archived && (
              <div className="flex space-x-2">
                <button
                  onClick={() => loadShopMovements(shop.id)}
                  className="text-orange-500 active:opacity-70 text-sm"
                >
                  {isExpanded ? 'Hide' : 'Show'} History
                </button>
                {confirmArchive === shop.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleArchiveShop(shop)}
                      className="text-sm text-red-500 active:opacity-70"
                    >
                      Yes, archive
                    </button>
                    <button
                      onClick={() => setConfirmArchive(null)}
                      className="text-sm text-gray-600 active:opacity-70"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmArchive(shop.id)}
                    className="text-red-500 text-sm active:opacity-70"
                  >
                    Archive
                  </button>
                )}
                {archiveError && confirmArchive === shop.id && (
                  <p className="text-xs text-red-500 mt-1">{archiveError}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(shop.total_distributed)}
              </p>
              <p className="text-xs text-gray-500">cartons</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last delivery</p>
              <p className="text-lg font-semibold text-gray-900">
                {/* Load last delivery on demand when expanded */}
                {isExpanded && movements.length > 0 ? 
                  formatDate(movements[0].recorded_at) : 
                  'Show history'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Expanded History Section */}
        {isExpanded && movements.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900 mb-3">Delivery History</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {movements.map((movement) => (
                <div key={movement.id} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                  <div>
                    <span className="font-medium">{movement.product?.name}</span>
                    <span className="text-gray-500 ml-2">({movement.product?.sku_code})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-orange-500">
                      {formatNumber(Math.abs(movement.qty))} cartons
                    </span>
                    <div className="text-xs text-gray-500">
                      {formatDate(movement.recorded_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isExpanded && movements.length === 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-gray-500">No delivery history found</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Shops</h1>
          <p className="text-gray-600 mt-2">Manage delivery destinations and view distribution history</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg active:opacity-70"
        >
          Add Shop
        </button>
      </div>

      {/* Show Archived Toggle */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Show archived shops</span>
        </label>
      </div>

      {/* Add Shop Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Shop</h3>
          <form onSubmit={handleAddShop}>
            {createError && (
              <p className="text-sm text-red-500 mb-3">{createError}</p>
            )}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={newShopName}
                onChange={(e) => setNewShopName(e.target.value)}
                className="w-full h-12 border border-gray-200 rounded-lg px-3 text-base focus:outline-none focus:border-orange-500"
                placeholder="Enter shop name..."
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-orange-500 text-white rounded-lg text-sm font-medium active:opacity-70 disabled:opacity-40"
              >
                {loading ? 'Adding...' : 'Add Shop'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewShopName('')
                  setCreateError(null)
                }}
                className="w-full h-12 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm active:opacity-70"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>

      {/* Empty State */}
      {filteredShops.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showArchived ? 'No shops found' : 'No shops yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {showArchived ? 
              'No shops match your current filters' : 
              'Add your first shop to get started with deliveries'
            }
          </p>
          {!showArchived && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg active:opacity-70"
            >
              Add Your First Shop
            </button>
          )}
        </div>
      )}
    </div>
  )
}
