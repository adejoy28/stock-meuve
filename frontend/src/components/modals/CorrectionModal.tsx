// CorrectionModal.tsx — Modal to add a correcting entry for a wrong record
// Product selector, optional shop selector, quantity (positive/negative), and required note

'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordCorrection } from '@/lib/api'
import type { Product, Shop } from '@/types'

export default function CorrectionModal() {
  const { activeModal, closeModal, products, shops, refreshProducts } = useStock()
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedShop, setSelectedShop] = useState('')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isOpen = activeModal === 'correction'

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSelectedProduct('')
      setSelectedShop('')
      setQuantity('')
      setNote('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!selectedProduct) {
      setError('Please select a product')
      setLoading(false)
      return
    }

    if (!quantity) {
      setError('Please enter a quantity')
      setLoading(false)
      return
    }

    if (!note.trim()) {
      setError('Please provide a note explaining the correction')
      setLoading(false)
      return
    }

    try {
      const correctionData = {
        product_id: parseInt(selectedProduct),  // ← product_id not sku_id
        qty: parseFloat(quantity),              // ← can be positive or negative
        note: note.trim(),
        shop_id: selectedShop ? parseInt(selectedShop) : null,
        // remove recorded_at — backend sets it automatically
      }

      await recordCorrection(correctionData)

      await refreshProducts()
      closeModal()
    } catch (error) {
      setError('Failed to record correction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedProductData = products.find(p => p.id.toString() === selectedProduct)

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Record Correction">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Product Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product *
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={products.length === 0}
            className="w-full px-3 py-3 border border-gray-200 bg-white rounded-lg text-base text-gray-900 focus:outline-none focus:border-orange-500 disabled:opacity-40"
            required
          >
            <option value="">Select a product...</option>
            {products.map((product: Product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku_code}) - {product.balance} units available
              </option>
            ))}
          </select>
        </div>

        {/* Shop Selector (Optional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop (optional - only for distribution corrections)
          </label>
          <select
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            disabled={shops.length === 0}
            className="w-full px-3 py-3 border border-gray-200 bg-white rounded-lg text-base text-gray-900 focus:outline-none focus:border-orange-500 disabled:opacity-40"
          >
            <option value="">No shop (stock correction)</option>
            {shops
              .filter((shop: Shop) => !shop.archived)
              .map((shop: Shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
          </select>
        </div>

        {/* Quantity Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity *
          </label>
          <input
            type="number"
            step="0.01"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
            placeholder="Enter positive or negative quantity"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter positive to add stock, negative to remove stock. Use this to correct previous errors.
          </p>
          {selectedProductData && (
            <p className="text-xs text-gray-500 mt-1">
              Current balance: {selectedProductData.balance} units
            </p>
          )}
        </div>

        {/* Note Input (Required) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note *
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
            rows={4}
            placeholder="Explain what this correction fixes..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This note is required to document the reason for this correction.
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white text-sm font-medium rounded-lg h-12 px-5 w-full active:opacity-70 disabled:opacity-40"
          >
            {loading ? 'Recording...' : 'Record Correction'}
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="bg-white text-gray-700 text-sm font-medium rounded-lg h-12 px-5 border border-gray-200 w-full active:opacity-70"
          >
            Cancel
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
