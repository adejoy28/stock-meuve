'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordReceipt } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { formatNumber } from '@/lib/helpers'

export default function ReceiveGoodsModal() {
  const { activeModal, closeModal, products, refreshProducts } = useStock()
  const [receiptData, setReceiptData] = useState<Record<string, string>>({})
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [alreadyRecorded, setAlreadyRecorded] = useState(false)

  const isOpen = activeModal === 'receipt'

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku_code.toLowerCase().includes(search.toLowerCase())
  )

  const totalCartons = Object.values(receiptData).reduce(
    (sum, v) => sum + (parseInt(v) || 0), 0
  )

  useEffect(() => {
    if (isOpen) {
      setReceiptData({})
      setNote('')
      setSearch('')
      setError('')

      const today = new Date().toISOString().split('T')[0]
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/movements?type=receipt&from=${today}&to=${today}`)
        .then(r => r.json())
        .then(d => {
          const items = d.data || d
          setAlreadyRecorded(Array.isArray(items) && items.length > 0)
        })
        .catch(() => {})
    }
  }, [isOpen])

  const handleSubmit = async () => {
    setError('')

    const productItems = Object.entries(receiptData)
      .filter(([_, v]) => parseInt(v) > 0)
      .map(([productId, qty]) => ({
        product_id: parseInt(productId),
        qty:        parseInt(qty),
      }))

    if (productItems.length === 0) {
      setError('Enter a quantity for at least one product')
      return
    }

    setLoading(true)
    try {
      await recordReceipt({
        products: productItems,
        note: note.trim() || null,
      })
      closeModal()
      refreshProducts()
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Receive Goods">

      {alreadyRecorded && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
          <p className="text-xs font-semibold text-orange-600 mb-0.5">Goods already received today</p>
          <p className="text-xs text-orange-500">
            A receipt was already recorded today. You can still add another if you received more goods.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-orange-500"
          placeholder="Search products..."
        />
      </div>

      {/* Product list */}
      <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
        {filteredProducts.map(product => (
          <div key={product.id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
              <p className="text-xs text-gray-400">{product.sku_code} · balance: {formatNumber(product.balance)}</p>
            </div>
            <input
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              value={receiptData[product.id.toString()] || ''}
              onChange={e => setReceiptData(prev => ({ ...prev, [product.id.toString()]: e.target.value }))}
              className="w-20 px-2 py-2 border border-gray-200 bg-white rounded-lg text-sm text-center focus:outline-none focus:border-orange-500"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="mb-4">
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
          rows={2}
          placeholder="Note (optional) — e.g. supplier name, delivery ref..."
        />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        {totalCartons > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total received</span>
            <span className="text-lg font-bold text-green-600">{formatNumber(totalCartons)} cartons</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 bg-orange-500 text-white text-sm font-semibold rounded-xl active:opacity-70 disabled:opacity-40"
        >
          {loading ? 'Recording...' : 'Record Receipt'}
        </button>
        <button
          type="button"
          onClick={closeModal}
          className="w-full h-12 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl active:opacity-70"
        >
          Cancel
        </button>
      </div>
    </BaseModal>
  )
}
