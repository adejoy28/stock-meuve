'use client'

import { useState, useEffect } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordCorrection } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { formatNumber } from '@/lib/helpers'
import type { Shop } from '@/types'

export default function CorrectionModal() {
  const { activeModal, closeModal, products, shops, refreshProducts } = useStock()
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedShop, setSelectedShop] = useState('')
  const [direction, setDirection] = useState<'add' | 'remove'>('add')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isOpen = activeModal === 'correction'

  const suggestions = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku_code.toLowerCase().includes(search.toLowerCase())
  )

  const selectedProductData = products.find(p => p.id.toString() === selectedProduct)

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct('')
      setSelectedShop('')
      setDirection('add')
      setQuantity('')
      setNote('')
      setSearch('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    setError('')

    if (!selectedProduct) { setError('Select a product'); return }
    if (!quantity || parseInt(quantity) <= 0) { setError('Enter a valid quantity'); return }
    if (!note.trim()) { setError('A note is required for corrections'); return }

    const signedQty = direction === 'remove' ? -parseInt(quantity) : parseInt(quantity)

    setLoading(true)
    try {
      await recordCorrection({
        product_id:  parseInt(selectedProduct),
        qty:         signedQty,
        note:        note.trim(),
        shop_id:     selectedShop ? parseInt(selectedShop) : null,
        recorded_at: new Date().toISOString(),
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
    <BaseModal isOpen={isOpen} onClose={closeModal} title="Record Correction">

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
                  <p className="text-xs text-gray-400">{p.sku_code} · {formatNumber(p.balance)} in stock</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Remove toggle */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Correction type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDirection('add')}
            className={`py-3 rounded-xl border-2 text-sm font-semibold active:opacity-70 ${
              direction === 'add'
                ? 'border-green-500 bg-green-50 text-green-600'
                : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            + Add stock
          </button>
          <button
            type="button"
            onClick={() => setDirection('remove')}
            className={`py-3 rounded-xl border-2 text-sm font-semibold active:opacity-70 ${
              direction === 'remove'
                ? 'border-red-400 bg-red-50 text-red-500'
                : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            − Remove stock
          </button>
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Quantity</label>
        <input
          type="number"
          step="1"
          min="1"
          inputMode="numeric"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:border-orange-500"
          placeholder="0"
        />
        {selectedProductData && (
          <p className="text-xs text-gray-400 mt-1">
            Current balance: {formatNumber(selectedProductData.balance)} cartons
            {quantity && parseInt(quantity) > 0 && (
              <span className={direction === 'add' ? ' text-green-600' : ' text-red-500'}>
                {' → '}{formatNumber(
                  direction === 'add'
                    ? selectedProductData.balance + parseInt(quantity)
                    : selectedProductData.balance - parseInt(quantity)
                )}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Shop (optional) */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
          Shop <span className="text-gray-300 font-normal normal-case">(optional — for distribution corrections)</span>
        </label>
        <select
          value={selectedShop}
          onChange={e => setSelectedShop(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:border-orange-500"
        >
          <option value="">No shop</option>
          {shops.filter((s: Shop) => !s.archived).map((s: Shop) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Note — required */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
          Note <span className="text-red-400">*</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
          rows={2}
          placeholder="Explain what this correction fixes..."
          required
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
          {loading ? 'Recording...' : 'Record Correction'}
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
