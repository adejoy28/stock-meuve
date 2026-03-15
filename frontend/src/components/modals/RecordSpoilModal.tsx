'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordSpoil } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { formatNumber } from '@/lib/helpers'
import type { Product } from '@/types'

const REASONS = [
  { value: 'damaged',  label: 'Damaged',  emoji: '💥' },
  { value: 'expired',  label: 'Expired',  emoji: '⏰' },
  { value: 'returned', label: 'Returned', emoji: '↩️' },
]

export default function RecordSpoilModal() {
  const { activeModal, closeModal, products, refreshProducts, pendingSpoilsCount, setPendingSpoilsCount } = useStock()
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isOpen = activeModal === 'spoil'

  const suggestions = products.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku_code.toLowerCase().includes(search.toLowerCase())) &&
    p.balance > 0
  )

  const selectedProductData = products.find(p => p.id.toString() === selectedProduct)

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct('')
      setQuantity('')
      setReason('')
      setNote('')
      setSearch('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    setError('')

    if (!selectedProduct) { setError('Select a product'); return }
    if (!quantity || parseInt(quantity) <= 0) { setError('Enter a valid quantity'); return }
    if (!reason) { setError('Select a reason'); return }

    setLoading(true)
    try {
      await recordSpoil({
        product_id:  parseInt(selectedProduct),
        qty:         parseInt(quantity),
        reason,
        note:        note.trim() || null,
        recorded_at: new Date().toISOString(),
      })
      closeModal()
      refreshProducts()
      setPendingSpoilsCount(pendingSpoilsCount + 1)
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Record Spoil">

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Product search */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Product</label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedProduct(''); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-orange-500"
            placeholder="Search product..."
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-44 overflow-y-auto">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => { setSelectedProduct(p.id.toString()); setSearch(p.name); setShowSuggestions(false) }}
                  className="w-full text-left px-3 py-2.5 border-b border-gray-50 last:border-0 active:bg-orange-50"
                >
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sku_code} · {formatNumber(p.balance)} available</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Quantity</label>
        <input
          type="number"
          step="1"
          min="1"
          max={selectedProductData?.balance}
          inputMode="numeric"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:border-orange-500"
          placeholder="0"
        />
        {selectedProductData && (
          <p className="text-xs text-gray-400 mt-1">
            {formatNumber(selectedProductData.balance)} cartons available
          </p>
        )}
      </div>

      {/* Reason — tap pills instead of dropdown */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Reason</label>
        <div className="grid grid-cols-3 gap-2">
          {REASONS.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={`flex flex-col items-center py-3 rounded-xl border-2 active:opacity-70 transition-colors ${
                reason === r.value
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 bg-white text-gray-500'
              }`}
            >
              <span className="text-xl mb-1">{r.emoji}</span>
              <span className="text-xs font-semibold">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Note (optional)</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
          rows={2}
          placeholder="Any additional details..."
        />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 bg-orange-500 text-white text-sm font-semibold rounded-xl active:opacity-70 disabled:opacity-40"
        >
          {loading ? 'Recording...' : 'Record Spoil'}
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
