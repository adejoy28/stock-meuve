// products/page.tsx — Manage Products page
// View all products with balances, add new products, edit existing products

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { createProduct, updateProduct, deleteProduct } from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { formatNumber } from '@/lib/helpers'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import type { Product } from '@/types'

interface FormData {
  name: string
  sku_code: string
  cost_price: string
}

export default function ProductsPage() {
  const { products, refreshProducts, productsLoading } = useStock()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sku_code: '',
    cost_price: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const formatCurrency = (num: number) => `₦${new Intl.NumberFormat('en-NG').format(num)}`

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        sku_code: editingProduct.sku_code,
        cost_price: editingProduct.cost_price.toString()
      })
    }
  }, [editingProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')

    try {
      const data = {
        ...formData,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
      } else {
        await createProduct(data)
      }

      await refreshProducts()
      resetForm()
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      
      if (ApiErrorHandler.isValidationError(apiError)) {
        setError(apiError.message)
      } else {
        setError('Failed to save product. Please try again.')
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowAddForm(true)
  }

  const handleDelete = async (product: Product) => {
    setDeleteError(null)
    
    try {
      await deleteProduct(product.id)
      await refreshProducts()
      setConfirmDelete(null)
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      
      if (ApiErrorHandler.isConflictError(apiError)) {
        setDeleteError('Cannot delete product with existing movements. Archive it instead.')
      } else {
        setDeleteError('Failed to delete product. Please try again.')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      sku_code: '',
      cost_price: ''
    })
    setEditingProduct(null)
    setShowAddForm(false)
    setError('')
    setDeleteError(null)
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog and inventory</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg active:opacity-70"
        >
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name or SKU code..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingProduct) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU Code *
                </label>
                <input
                  type="text"
                  value={formData.sku_code}
                  onChange={(e) => setFormData({...formData, sku_code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
              <button
                type="submit"
                disabled={formLoading}
                className="w-full md:w-auto h-12 bg-orange-500 text-white rounded-lg text-sm font-medium active:opacity-70 disabled:opacity-40"
              >
                {formLoading ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full md:w-auto h-12 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm active:opacity-70"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Products ({filteredProducts.length})
          </h3>
        </div>

        {productsLoading ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon="📦"
            title={searchTerm ? 'No products found' : 'No products yet'}
            description={searchTerm ? 'Try adjusting your search terms' : 'Add your first product to get started'}
            action={!searchTerm ? {
              label: 'Add Your First Product',
              onClick: () => setShowAddForm(true)
            } : undefined}
          />
        ) : (
          <>
            {/* Mobile product cards */}
            <div className="md:hidden space-y-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{product.sku_code}</p>
                    </div>
                    <div className={`text-xl font-bold ml-3 flex-shrink-0 ${
                      product.balance === 0 ? 'text-red-500' :
                      product.balance <= 5 ? 'text-orange-500' : 'text-green-600'
                    }`}>
                      {formatNumber(product.balance)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {product.cost_price > 0 ? formatCurrency(product.cost_price) : 'No price set'}
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-sm text-orange-500 font-medium active:opacity-70"
                      >
                        Edit
                      </button>
                      {confirmDelete === product.id ? (
                        <span className="flex gap-2">
                          <button onClick={() => handleDelete(product)} className="text-sm text-red-500 active:opacity-70">Confirm</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-sm text-gray-400 active:opacity-70">Cancel</button>
                        </span>
                      ) : (
                        <button onClick={() => setConfirmDelete(product.id)} className="text-sm text-red-500 active:opacity-70">Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table — hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.sku_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.cost_price > 0 ? formatCurrency(product.cost_price) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          product.balance === 0 ? 'text-red-600' :
                          product.balance <= 5 ? 'text-orange-500' : 'text-green-600'
                        }`}>
                          {formatNumber(product.balance)} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-orange-500 active:opacity-70 mr-3"
                        >
                          Edit
                        </button>
                        {confirmDelete === product.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(product)}
                              className="text-sm text-red-500 active:opacity-70"
                            >
                              Yes, delete
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-sm text-gray-600 active:opacity-70"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(product.id)}
                            className="text-red-500 text-sm active:opacity-70 ml-3"
                          >
                            Delete
                          </button>
                        )}
                        {deleteError && confirmDelete === product.id && (
                          <p className="text-xs text-red-500 mt-1">{deleteError}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
