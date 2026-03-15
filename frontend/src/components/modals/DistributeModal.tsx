'use client'

import { useState, useEffect, useRef } from 'react'
import BaseModal from '@/components/ui/BaseModal'
import { useStock } from '@/context/StockContext'
import { recordDistribution, createShop } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { formatCurrency, formatNumber } from '@/lib/helpers'
import type { Product } from '@/types'

interface DistributionRow {
  id: string           // unique row id
  productId: string
  qty: string
  sellingPrice: string
  search: string
  showSuggestions: boolean
}

function newRow(): DistributionRow {
  return {
    id: Math.random().toString(36).slice(2),
    productId: '',
    qty: '',
    sellingPrice: '',
    search: '',
    showSuggestions: false,
  }
}

export default function DistributeModal() {
  const { activeModal, closeModal, products, shops, refreshProducts, refreshShops } = useStock()
  const [selectedShop, setSelectedShop] = useState('')
  const [rows, setRows] = useState<DistributionRow[]>([newRow()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNewShopForm, setShowNewShopForm] = useState(false)
  const [newShopName, setNewShopName] = useState('')
  const searchRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const isOpen = activeModal === 'distribution'
  const availableProducts = products.filter(p => p.balance > 0)

  // IDs of products already added in any row
  const usedProductIds = rows.map(r => r.productId).filter(Boolean)

  useEffect(() => {
    if (isOpen) {
      setSelectedShop('')
      setRows([newRow()])
      setError('')
      setShowNewShopForm(false)
      setNewShopName('')
    }
  }, [isOpen])

  // Suggestions for a given row — exclude already-used products
  const getSuggestions = (row: DistributionRow): Product[] => {
    const term = row.search.toLowerCase()
    return availableProducts.filter(p => {
      if (usedProductIds.includes(p.id.toString()) && p.id.toString() !== row.productId) return false
      if (!term) return true
      return p.name.toLowerCase().includes(term) || p.sku_code.toLowerCase().includes(term)
    })
  }

  const updateRow = (id: string, patch: Partial<DistributionRow>) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  const selectProduct = (rowId: string, product: Product) => {
    updateRow(rowId, {
      productId: product.id.toString(),
      search: product.name,
      sellingPrice: product.cost_price > 0 ? product.cost_price.toString() : '',
      showSuggestions: false,
    })
    // Focus qty input after selecting product
    setTimeout(() => {
      const el = document.getElementById(`qty-${rowId}`)
      if (el) el.focus()
    }, 50)
  }

  const removeRow = (id: string) => {
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev)
  }

  const addRow = () => {
    setRows(prev => [...prev, newRow()])
  }

  // Totals
  const totalCartons = rows.reduce((sum, r) => sum + (parseInt(r.qty) || 0), 0)
  const totalValue = rows.reduce((sum, r) => {
    const qty = parseInt(r.qty) || 0
    const price = parseFloat(r.sellingPrice) || 0
    return sum + qty * price
  }, 0)

  const handleShopChange = (shopId: string) => {
    if (shopId === 'new') {
      setShowNewShopForm(true)
    } else {
      setSelectedShop(shopId)
      setShowNewShopForm(false)
    }
  }

  const handleCreateShop = async () => {
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

  const handleSubmit = async () => {
    setError('')

    if (!selectedShop) {
      setError('Please select a shop')
      return
    }

    const validRows = rows.filter(r => r.productId && parseInt(r.qty) > 0)
    if (validRows.length === 0) {
      setError('Add at least one product with a quantity')
      return
    }

    // Check for incomplete rows
    const incompleteRow = rows.find(r => r.productId && !parseInt(r.qty))
    if (incompleteRow) {
      setError('Enter a quantity for all added products')
      return
    }

    setLoading(true)
    try {
      const productsPayload = validRows.map(r => {
        const product = products.find(p => p.id.toString() === r.productId)
        const sellingPrice = r.sellingPrice !== ''
          ? parseFloat(r.sellingPrice)
          : (product?.cost_price ?? null)
        return {
          product_id:    parseInt(r.productId),
          qty:           parseInt(r.qty),
          selling_price: sellingPrice,
        }
      })

      await recordDistribution({
        shop_id:  parseInt(selectedShop),
        products: productsPayload,
        note:     '',
      })

      closeModal()
      refreshProducts()
      refreshShops()
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

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Shop selector */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
          Shop
        </label>
        <select
          value={selectedShop}
          onChange={e => handleShopChange(e.target.value)}
          className="w-full px-3 py-3 border border-gray-200 bg-white rounded-xl text-sm text-gray-900 focus:outline-none focus:border-orange-500"
        >
          <option value="">Choose a shop...</option>
          {shops.filter(s => !s.archived).map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="new">+ Add new shop</option>
        </select>

        {/* Inline new shop form */}
        {showNewShopForm && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newShopName}
              onChange={e => setNewShopName(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500"
              placeholder="Shop name..."
              autoFocus
            />
            <button
              type="button"
              onClick={handleCreateShop}
              className="bg-orange-500 text-white text-xs font-semibold px-4 rounded-xl active:opacity-70"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowNewShopForm(false)}
              className="border border-gray-200 text-gray-500 text-xs px-3 rounded-xl active:opacity-70"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Product rows */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Products
        </label>

        <div className="space-y-3">
          {rows.map((row, index) => {
            const suggestions = getSuggestions(row)
            const selectedProduct = products.find(p => p.id.toString() === row.productId)
            const lineTotal = (parseInt(row.qty) || 0) * (parseFloat(row.sellingPrice) || 0)

            return (
              <div key={row.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50 relative">

                {/* Row number + remove button */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400">
                    Product {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {lineTotal > 0 && (
                      <span className="text-xs font-semibold text-orange-500">
                        {formatCurrency(lineTotal)}
                      </span>
                    )}
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center active:opacity-70"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Product search input */}
                <div className="relative mb-2">
                  <input
                    ref={el => { searchRefs.current[row.id] = el }}
                    type="text"
                    value={row.search}
                    onChange={e => updateRow(row.id, {
                      search: e.target.value,
                      productId: '',
                      sellingPrice: '',
                      showSuggestions: true,
                    })}
                    onFocus={() => updateRow(row.id, { showSuggestions: true })}
                    onBlur={() => setTimeout(() => updateRow(row.id, { showSuggestions: false }), 150)}
                    className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="Search product by name or SKU..."
                  />

                  {/* Suggestions dropdown */}
                  {row.showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-44 overflow-y-auto">
                      {suggestions.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onMouseDown={() => selectProduct(row.id, product)}
                          className="w-full text-left px-3 py-2.5 hover:bg-orange-50 active:bg-orange-100 border-b border-gray-50 last:border-0"
                        >
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400">
                            {product.sku_code} · {formatNumber(product.balance)} available
                            {product.cost_price > 0 && ` · ${formatCurrency(product.cost_price)}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No results */}
                  {row.showSuggestions && row.search && suggestions.length === 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 px-3 py-3">
                      <p className="text-xs text-gray-400">No products found</p>
                    </div>
                  )}
                </div>

                {/* Qty + Selling price — only show after product selected */}
                {row.productId && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Qty (cartons)</label>
                      <input
                        id={`qty-${row.id}`}
                        type="number"
                        step="1"
                        min="1"
                        max={selectedProduct?.balance}
                        inputMode="numeric"
                        value={row.qty}
                        onChange={e => updateRow(row.id, { qty: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500"
                        placeholder="0"
                      />
                      {selectedProduct && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          max {formatNumber(selectedProduct.balance)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Selling price (₦)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        inputMode="numeric"
                        value={row.sellingPrice}
                        onChange={e => updateRow(row.id, { sellingPrice: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500"
                        placeholder={selectedProduct?.cost_price?.toString() || '0'}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add product button */}
      {availableProducts.length > usedProductIds.length && (
        <button
          type="button"
          onClick={addRow}
          className="w-full h-10 border-2 border-dashed border-orange-300 text-orange-500 text-sm font-medium rounded-xl active:opacity-70 mb-5 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      )}

      {/* Footer totals + submit */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        {totalCartons > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total</span>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">{formatNumber(totalCartons)} cartons</span>
              {totalValue > 0 && (
                <p className="text-sm font-semibold text-orange-500">{formatCurrency(totalValue)}</p>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 bg-orange-500 text-white text-sm font-semibold rounded-xl active:opacity-70 disabled:opacity-40"
        >
          {loading ? 'Recording...' : 'Record Distribution'}
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
