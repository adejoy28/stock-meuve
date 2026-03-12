// OpeningStockModal.tsx — Modal to set opening stock at the start of day
// Pre-fills each Product's qty input with its current balance (yesterday's closing)

'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordOpening } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { useToast } from '@/components/ui/Toast'
import type { Product } from '@/types'

export default function OpeningStockModal() {
  const { activeModal, closeModal, products, refreshProducts } = useStock()
  const { showToast } = useToast()
  const [openingData, setOpeningData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [alreadyRecorded, setAlreadyRecorded] = useState(false)

  const isOpen = activeModal === 'opening'

  useEffect(() => {
    if (isOpen && products.length > 0) {
      // Pre-fill with current balances
      const data: Record<string, number> = {}
      products.forEach(product => {
        data[product.id.toString()] = product.balance || 0
      })
      setOpeningData(data)
      
      // Check if opening stock already recorded today
      const checkTodayOpening = async () => {
        try {
          const today = new Date().toISOString().split('T')[0]
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movements?type=opening&from=${today}&to=${today}`)
          if (response.ok) {
            const data = await response.json()
            const todayOpenings = data.data || data
            setAlreadyRecorded(todayOpenings.length > 0)
          }
        } catch (error) {
          console.error('Failed to check today\'s opening:', error)
        }
      }
      
      checkTodayOpening()
    }
  }, [isOpen, products])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Build array of products with qty > 0
      const products = Object.entries(openingData)
        .filter(([_, qty]) => qty > 0)
        .map(([productId, qty]) => ({
          product_id: parseInt(productId),  // ← product_id not sku_id
          qty: Math.round(parseFloat(qty.toString())),
        }))

      if (products.length === 0) {
        setError('Please enter quantities for at least one product')
        setLoading(false)
        return
      }

      // Send all products in a single request
      await recordOpening({ products })

      closeModal()           // Close immediately — prevents re-submission
      refreshProducts()      // Refresh in background — no await needed
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      if (ApiErrorHandler.isConflictError(apiError)) {
        setError('Opening stock has already been recorded today')
      } else if (ApiErrorHandler.isValidationError(apiError)) {
        setError(apiError.message)
      } else {
        setError('Failed to record opening stock. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQtyChange = (productId: string, value: string) => {
    const qty = parseFloat(value) || 0
    setOpeningData(prev => ({
      ...prev,
      [productId]: qty
    }))
  }

  if (!isOpen) return null

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Opening Stock">
      {alreadyRecorded ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Already Recorded Today</h3>
          <p className="text-sm text-gray-700 mb-4">
            Opening stock has already been recorded for today. Use a correction entry if needed.
          </p>
          <button
            onClick={closeModal}
            className="bg-white text-gray-700 text-sm font-medium rounded-lg h-12 px-5 border border-gray-200 w-full active:opacity-70"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <div key={product.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {product.name} ({product.sku_code})
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs text-gray-400">
                  Yesterday's closing: {product.balance} units
                </p>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="numeric"
                  value={openingData[product.id.toString()] || ''}
                  onChange={(e) => handleQtyChange(product.id.toString(), e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={closeModal}
              className="bg-white text-gray-700 text-sm font-medium rounded-lg h-12 px-5 border border-gray-200 w-full active:opacity-70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 text-white text-sm font-medium rounded-lg h-12 px-5 w-full active:opacity-70 disabled:opacity-40"
            >
              {loading ? 'Recording...' : 'Record Opening Stock'}
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  )
}
