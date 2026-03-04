// movements/page.tsx — Full log of every movement, filterable
// Type, product, shop, and date range filters with detailed movement table

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { getMovements } from '@/lib/api'
import TypeBadge from '@/components/ui/TypeBadge'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import type { Product, Shop, Movement } from '@/types'

interface Filters {
  type: string
  product_id: string
  shop_id: string
  from: string
  to: string
}

export default function MovementsPage() {
  const { products, shops, refreshMovements } = useStock()
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    product_id: '',
    shop_id: '',
    from: '',
    to: ''
  })

  // Load movements when filters change
  useEffect(() => {
    loadMovements()
  }, [filters])

  const loadMovements = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      
      // Add filters that have values
      if (filters.type && filters.type !== 'all') {
        params.type = filters.type
      }
      if (filters.product_id) {
        params.sku_id = filters.product_id
      }
      if (filters.shop_id) {
        params.shop_id = filters.shop_id
      }
      if (filters.from) {
        params.from = filters.from
      }
      if (filters.to) {
        params.to = filters.to
      }

      const response = await getMovements(params)
      console.log('Raw movements response:', response)
      console.log('Movements response data:', response.data)
      
      // Handle different possible response structures
      let movementsArray = response.data
      if (response.data && Array.isArray(response.data.data)) {
        movementsArray = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        movementsArray = response.data
      } else {
        console.error('Unexpected movements response structure:', response.data)
        movementsArray = []
      }
      
      console.log('Setting movements to:', movementsArray)
      setMovements(movementsArray)
    } catch (error) {
      console.error('Failed to load movements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Movements</h1>
        <p className="text-sm text-gray-700 mt-2">Complete log of all stock movements</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="opening">Opening</option>
              <option value="receipt">Receipt</option>
              <option value="distribution">Distribution</option>
              <option value="correction">Correction</option>
              <option value="spoil">Spoil</option>
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Product
            </label>
            <select
              value={filters.product_id}
              onChange={(e) => handleFilterChange('product_id', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Products</option>
              {Array.isArray(products) ? products.map((product: Product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku_code})
                </option>
              )) : (
                <option value="">Loading products...</option>
              )}
            </select>
          </div>

          {/* Shop Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Shop
            </label>
            <select
              value={filters.shop_id}
              onChange={(e) => handleFilterChange('shop_id', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Shops</option>
              {shops.filter(shop => !shop.archived).map(shop => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="mt-4">
          <button
            onClick={() => setFilters({
              type: 'all',
              product_id: '',
              shop_id: '',
              from: '',
              to: ''
            })}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Movements ({movements.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSkeleton type="table" rows={10} />
        ) : movements.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No movements yet"
            description={
              Object.values(filters).some(v => v) ? 
                'Try adjusting your filters' : 
                'No movements have been recorded yet'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop / Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(movement.recorded_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(movement.recorded_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {movement.product?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {movement.product?.sku_code || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={movement.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        movement.qty > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.qty > 0 ? '+' : ''}{formatNumber(movement.qty)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {movement.shop?.name || movement.note || '-'}
                        {movement.type === 'correction' && movement.note && (
                          <div className="text-xs text-gray-500 mt-1">
                            {movement.note}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movement.status && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          movement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          movement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          movement.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {movement.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
