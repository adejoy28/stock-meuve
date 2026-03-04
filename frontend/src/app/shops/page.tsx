// shops/page.tsx — Manage delivery destinations and view per-shop history
// Grid of shop cards with delivery stats and management actions

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { createShop, archiveShop } from '@/lib/api'
import { getMovements } from '@/lib/api'
import type { Shop, Movement } from '@/types'

interface ShopStats {
  [key: number]: {
    totalDistributed: number
    lastDelivery: string | null
    deliveriesCount: number
  }
}

interface ShopMovements {
  [key: number]: Movement[]
}

export default function ShopsPage() {
  const { shops, refreshShops } = useStock()
  const [showArchived, setShowArchived] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newShopName, setNewShopName] = useState('')
  const [loading, setLoading] = useState(false)
  const [shopStats, setShopStats] = useState<ShopStats>({})
  const [expandedShop, setExpandedShop] = useState<number | null>(null)
  const [shopMovements, setShopMovements] = useState<ShopMovements>({})

  // Filter shops based on archived status - add safety check
  const filteredShops = Array.isArray(shops) ? shops.filter((shop: Shop) => 
    showArchived ? true : !shop.archived
  ) : []

  // Load shop statistics
  useEffect(() => {
    loadShopStats()
  }, [shops])

  const loadShopStats = async () => {
    const stats: ShopStats = {}
    
    for (const shop of shops) {
      try {
        // Get all distribution movements for this shop
        const response = await getMovements({ shop_id: shop.id, type: 'distribution' })
        console.log('Shop movements response:', response)
        
        let movementsArray: Movement[] = []
        if (response.data && Array.isArray(response.data.data)) {
          movementsArray = response.data.data
        } else if (response.data && Array.isArray(response.data)) {
          movementsArray = response.data
        } else {
          movementsArray = []
        }
        
        const movements = movementsArray
        
        // Calculate total distributed
        const totalDistributed = movements.reduce((sum: number, movement: Movement) => 
          sum + Math.abs(movement.qty), 0
        )
        
        // Find last delivery date
        const lastDelivery = movements.length > 0 ? 
          movements.reduce((latest: Movement, movement: Movement) => 
            new Date(movement.recorded_at) > new Date(latest.recorded_at) ? movement : latest
          ).recorded_at : null
        
        stats[shop.id] = {
          totalDistributed,
          lastDelivery,
          deliveriesCount: movements.length
        }
      } catch (error) {
        console.error(`Failed to load stats for shop ${shop.id}:`, error)
        stats[shop.id] = {
          totalDistributed: 0,
          lastDelivery: null,
          deliveriesCount: 0
        }
      }
    }
    
    setShopStats(stats)
  }

  const handleAddShop = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShopName.trim()) return

    setLoading(true)
    try {
      await createShop({ name: newShopName.trim() })
      await refreshShops()
      setNewShopName('')
      setShowAddForm(false)
    } catch (error) {
      alert('Failed to create shop. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveShop = async (shop: Shop) => {
    if (!confirm(`Are you sure you want to archive "${shop.name}"? This will hide it from the active list.`)) {
      return
    }

    try {
      await archiveShop(shop.id)
      await refreshShops()
    } catch (error) {
      alert('Failed to archive shop. Please try again.')
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
      console.log('Shop detail movements response:', response)
      
      let movementsArray = response.data
      if (response.data && Array.isArray(response.data.data)) {
        movementsArray = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        movementsArray = response.data
      } else {
        movementsArray = []
      }
      
      setShopMovements(prev => ({
        ...prev,
        [shopId]: movementsArray
      }))
      setExpandedShop(shopId)
    } catch (error) {
      console.error('Failed to load shop movements:', error)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const ShopCard = ({ shop }: { shop: Shop }) => {
    const stats = shopStats[shop.id] || { totalDistributed: 0, lastDelivery: null, deliveriesCount: 0 }
    const isExpanded = expandedShop === shop.id
    const movements = shopMovements[shop.id] || []

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {isExpanded ? 'Hide' : 'Show'} History
                </button>
                <button
                  onClick={() => handleArchiveShop(shop)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Archive
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Delivered</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(stats.totalDistributed)}
              </p>
              <p className="text-xs text-gray-500">cartons (all time)</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Delivery</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.lastDelivery ? 
                  formatDate(stats.lastDelivery) : 
                  'No deliveries yet'
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
                    <span className="font-medium text-blue-600">
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
          <h1 className="text-3xl font-bold text-gray-900">Shops</h1>
          <p className="text-gray-600 mt-2">Manage delivery destinations and view distribution history</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Shop
        </button>
      </div>

      {/* Show Archived Toggle */}
      <div className="bg-white p-4 rounded-lg shadow">
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Shop</h3>
          <form onSubmit={handleAddShop}>
            <div className="flex space-x-4">
              <input
                type="text"
                value={newShopName}
                onChange={(e) => setNewShopName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter shop name..."
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Shop'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewShopName('')
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
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
        <div className="bg-white p-8 rounded-lg shadow text-center">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Shop
            </button>
          )}
        </div>
      )}
    </div>
  )
}
