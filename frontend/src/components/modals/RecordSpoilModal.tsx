// RecordSpoilModal.tsx — Modal to record spoiled/damaged/returned stock
// Product selector, qty, reason (damaged/expired/returned), and optional note

'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordSpoil } from '@/lib/api'
import type { Product } from '@/types'

export default function RecordSpoilModal() {
  const { activeModal, closeModal, products, refreshProducts, pendingSpoilsCount, setPendingSpoilsCount } = useStock()
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isOpen = activeModal === 'spoil'

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSelectedProduct('')
      setQuantity('')
      setReason('')
      setNote('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!selectedProduct || !quantity || !reason) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      await recordSpoil({
        sku_id: parseInt(selectedProduct),
        qty: parseFloat(quantity),
        reason,
        note: note.trim() || null,
        recorded_at: new Date().toISOString()
      })

      await refreshProducts()
      setPendingSpoilsCount(pendingSpoilsCount + 1)
      closeModal()
    } catch (error) {
      setError('Failed to record spoil. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedProductData = products.find(p => p.id.toString() === selectedProduct)

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Record Spoil">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {/* Product Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product *
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={products.length === 0}
            className="w-full px-3 py-3 border border-gray-200 bg-white text-base text-gray-900 focus:outline-none focus:border-orange-500 disabled:opacity-40"
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

        {/* Quantity */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity *
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
            placeholder="0"
            required
          />
          {selectedProductData && (
            <p className="text-xs text-gray-400 mt-1">
              Available: {selectedProductData.balance} units
            </p>
          )}
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason *
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-3 border border-gray-200 bg-white text-base text-gray-900 focus:outline-none focus:border-orange-500"
            required
          >
            <option value="">Select a reason...</option>
            <option value="damaged">Damaged</option>
            <option value="expired">Expired</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
            rows={3}
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white text-sm font-medium rounded-lg h-12 px-5 w-full active:opacity-70 disabled:opacity-40"
          >
            {loading ? 'Recording...' : 'Record Spoil'}
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
