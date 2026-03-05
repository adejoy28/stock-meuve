// ReceiveGoodsModal.tsx — Modal to record stock received from warehouse
// Shows all Products with qty input (default 0) and optional note field

'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordReceipt } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import type { Product } from '@/types'

export default function ReceiveGoodsModal() {
  const { activeModal, closeModal, products, refreshProducts } = useStock()
  const [receiptData, setReceiptData] = useState<Record<string, number>>({})
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [alreadyRecorded, setAlreadyRecorded] = useState(false)

  const isOpen = activeModal === 'receipt'

  useEffect(() => {
    if (isOpen && products.length > 0) {
      // Pre-fill with 0 quantities
      const data: Record<string, number> = {}
      products.forEach(product => {
        data[product.id] = 0
      })
      setReceiptData(data)
      
      // Check if receipt already recorded today
      checkTodayReceipt()
    }
  }, [isOpen, products])

  const checkTodayReceipt = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movements?type=receipt&from=${today}&to=${today}`)
      if (response.ok) {
        const data = await response.json()
        const todayReceipts = data.data || data
        setAlreadyRecorded(todayReceipts.length > 0)
      }
    } catch (error) {
      console.error('Failed to check today\'s receipt:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Build array of products with qty > 0
      const products = Object.entries(receiptData)
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

      // note is at the root level, not inside each product
      await recordReceipt({
        products,
        note: note.trim() || null,
      })

      await refreshProducts()
      closeModal()
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      if (ApiErrorHandler.isConflictError(apiError)) {
        setError('Goods have already been received today. Use a correction entry instead.')
      } else if (ApiErrorHandler.isValidationError(apiError)) {
        setError(apiError.message)
      } else {
        setError('Failed to record receipt. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQtyChange = (productId: string, value: string) => {
    const qty = parseFloat(value) || 0
    setReceiptData(prev => ({
      ...prev,
      [productId]: qty
    }))
  }

  if (!isOpen) return null

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Receive Goods">
      {alreadyRecorded ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Already Recorded Today</h3>
          <p className="text-sm text-gray-700 mb-4">
            Goods receipt has already been recorded for today. Use a correction entry if needed.
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
                  Current balance: {product.balance} units
                </p>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="numeric"
                  value={receiptData[product.id.toString()] || ''}
                  onChange={(e) => handleQtyChange(product.id.toString(), e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
              rows={3}
              placeholder="Add any notes about this receipt..."
            />
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
              {loading ? 'Recording...' : 'Record Receipt'}
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  )
}
