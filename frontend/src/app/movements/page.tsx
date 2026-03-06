// movements/page.tsx — Full log of every movement, filterable
// Type, product, shop, and date range filters with detailed movement table

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { getMovements } from '@/lib/api'
import { formatDate, formatTime, formatNumber, extractArray } from '@/lib/helpers'
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
  const [filtersOpen, setFiltersOpen] = useState(false)
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
        params.product_id = filters.product_id
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
      
      setMovements(extractArray<Movement>(response.data))
    } catch (error) {
      console.error('Failed to load movements:', error)
      setMovements([])
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

  // Count active filters for the badge
  const activeFilterCount = [
    filters.type !== 'all' ? 1 : 0,
    filters.product_id ? 1 : 0,
    filters.shop_id ? 1 : 0,
    filters.from ? 1 : 0,
    filters.to ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const clearFilters = () => setFilters({
    type: 'all',
    product_id: '',
    shop_id: '',
    from: '',
    to: ''
  })

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Movements</h1>
        <p className="text-sm text-gray-700 mt-2">Complete log of all stock movements</p>
      </div>

      {/* Filter toggle button */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{movements.length} movement{movements.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-orange-500 active:opacity-70"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border active:opacity-70 ${
              activeFilterCount > 0
                ? 'border-orange-500 text-orange-500 bg-orange-50'
                : 'border-gray-200 text-gray-600 bg-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible filter panel */}
      {filtersOpen && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Types</option>
              <option value="opening">Opening</option>
              <option value="receipt">Receipt</option>
              <option value="distribution">Distribution</option>
              <option value="correction">Correction</option>
              <option value="spoil">Spoil</option>
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Product</label>
            <select
              value={filters.product_id}
              onChange={(e) => handleFilterChange('product_id', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500"
            >
              <option value="">All Products</option>
              {Array.isArray(products) ? products.map((product: Product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              )) : (
                <option value="">Loading products...</option>
              )}
            </select>
          </div>

          {/* Shop */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Shop</label>
            <select
              value={filters.shop_id}
              onChange={(e) => handleFilterChange('shop_id', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500"
            >
              <option value="">All Shops</option>
              {shops.filter(shop => !shop.archived).map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          </div>

          {/* Date range — side by side */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">From</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">To</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Apply button */}
          <button
            onClick={() => setFiltersOpen(false)}
            className="w-full h-10 bg-orange-500 text-white text-sm font-medium rounded-lg active:opacity-70"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Movements Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
          <>
          <div className="hidden md:block overflow-x-auto">
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
                  <tr key={movement.id}>
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

          {/* Mobile cards — visible only on mobile */}
          <div className="md:hidden space-y-2">
            {movements.map((movement) => (
              <div key={movement.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <TypeBadge type={movement.type} />
                  <span className={`text-sm font-bold ${movement.qty > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {movement.qty > 0 ? '+' : ''}{formatNumber(movement.qty)}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">{movement.product?.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    {formatDate(movement.recorded_at)} · {formatTime(movement.recorded_at)}
                  </span>
                  <span className="text-xs text-gray-400">{movement.shop?.name || ''}</span>
                </div>
                {movement.note && (
                  <p className="text-xs text-gray-400 mt-1 italic">{movement.note}</p>
                )}
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  )
}
