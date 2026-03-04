// DistributeModal.tsx — Modal to record a delivery to a shop
// Shop selector, product list with live search, and quantity inputs

'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordDistribution, createShop } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import type { Product, Shop } from '@/types'

export default function DistributeModal() {
  const { activeModal, closeModal, products, shops, refreshProducts, refreshShops } = useStock()
  const [selectedShop, setSelectedShop] = useState('')
  const [distributionData, setDistributionData] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNewShopForm, setShowNewShopForm] = useState(false)
  const [newShopName, setNewShopName] = useState('')

  const isOpen = activeModal === 'distribution'

  // Filter products with balance > 0
  const availableProducts = products.filter((product: Product) => product.balance > 0)
  
  // Filter products by search term
  const filteredProducts = availableProducts.filter((product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku_code.toLowerCase().includes(searchTerm.toLowerCase())
    )

  // Calculate total quantity being distributed
  const totalQuantity = Object.values(distributionData).reduce((sum: number, qty: number) => sum + (qty || 0), 0)

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSelectedShop('')
      setDistributionData({})
      setSearchTerm('')
      setShowNewShopForm(false)
      setNewShopName('')
    }
  }, [isOpen])

  const handleShopChange = (shopId: string) => {
    if (shopId === 'new') {
      setShowNewShopForm(true)
    } else {
      setSelectedShop(shopId)
      setShowNewShopForm(false)
    }
  }

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShopName.trim()) return

    try {
      const response = await createShop({ name: newShopName.trim() })
      const newShop = response.data
      await refreshShops()
      setSelectedShop(newShop.id.toString())
      setShowNewShopForm(false)
      setNewShopName('')
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      setError(apiError.message)
    }
  }

  const handleQtyChange = (productId: string, value: string) => {
    const qty = parseFloat(value) || 0
    setDistributionData(prev => ({
      ...prev,
      [productId]: qty
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!selectedShop) {
        setError('Please select a shop')
        setLoading(false)
        return
      }

      // Only submit products with qty > 0
      const movements = Object.entries(distributionData)
        .filter(([_, qty]) => qty > 0)
        .map(([productId, qty]) => ({
          sku_id: parseInt(productId),
          qty: parseFloat(qty.toString()),
          shop_id: parseInt(selectedShop),
          recorded_at: new Date().toISOString()
        }))

      if (movements.length === 0) {
        setError('Please enter quantities for at least one product')
        setLoading(false)
        return
      }

      await recordDistribution({ movements })
      await refreshProducts()
      closeModal()
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Distribute to Shop">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Shop Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Shop *
          </label>
          <select
            value={selectedShop}
            onChange={(e) => handleShopChange(e.target.value)}
            disabled={shops.length === 0}
            className="w-full px-3 py-3 border border-gray-200 bg-white text-base text-gray-900 focus:outline-none focus:border-orange-500 disabled:opacity-40"
            required
          >
            <option value="">Choose a shop...</option>
            {shops.filter(shop => !shop.archived).map(shop => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
            <option value="new">+ Add new shop</option>
          </select>
        </div>

        {/* New Shop Form */}
        {showNewShopForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Create New Shop</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newShopName}
                onChange={(e) => setNewShopName(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
                placeholder="Enter shop name..."
                required
              />
              <button
                type="button"
                onClick={handleCreateShop}
                className="bg-orange-500 text-white text-sm font-medium rounded-lg h-12 px-5 active:opacity-70"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewShopForm(false)}
                className="bg-white text-gray-700 text-sm font-medium rounded-lg h-12 px-5 border border-gray-200 active:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Product Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Products
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
            placeholder="Search products by name or SKU code..."
          />
        </div>

        {/* Product List */}
        <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                {searchTerm ? 'No products found matching your search' : 'No products with available balance'}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {product.name} ({product.sku_code})
                </label>
                <p className="text-xs text-gray-400">
                  Available: {product.balance} units
                </p>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={product.balance}
                  inputMode="numeric"
                  value={distributionData[product.id.toString()] || ''}
                  onChange={(e) => handleQtyChange(product.id.toString(), e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="0"
                />
              </div>
            ))
          )}
        </div>

        {/* Footer with Total */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Total cartons to distribute:</span>
            <span className="text-2xl font-bold text-orange-500">{totalQuantity}</span>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 text-white text-sm font-medium rounded-lg h-12 px-5 w-full active:opacity-70 disabled:opacity-40"
            >
              {loading ? 'Recording...' : 'Record Distribution'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="bg-white text-gray-700 text-sm font-medium rounded-lg h-12 px-5 border border-gray-200 w-full active:opacity-70"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  )
}
