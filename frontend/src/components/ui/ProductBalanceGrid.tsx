// ProductBalanceGrid.tsx — Grid of Product cards showing current balance
// Props: products (array), onProductClick (optional function)

import type { Product } from '@/types'

interface ProductBalanceGridProps {
  products: Product[]
  onProductClick?: (product: Product) => void
}

export default function ProductBalanceGrid({ products, onProductClick }: ProductBalanceGridProps) {
  const getBalanceColor = (balance: number) => {
    if (balance === 0) return 'text-red-600 bg-red-50 border-red-200'
    if (balance <= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getBalanceText = (balance: number) => {
    if (balance === 0) return 'Out of Stock'
    if (balance <= 5) return 'Low Stock'
    return 'In Stock'
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onProductClick && onProductClick(product)}
          className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
            product.balance === 0 ? 'border-red-200' : 
            product.balance <= 5 ? 'border-yellow-200' : 
            'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {product.sku_code}
              </p>
              {product.cost_price > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Cost: ${formatNumber(product.cost_price)}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBalanceColor(product.balance)}`}>
              {getBalanceText(product.balance)}
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatNumber(product.balance)}
              </span>
              <span className="text-sm text-gray-500 ml-1">units</span>
            </div>
          </div>
        </div>
      ))}
      
      {products.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500">Add your first product to get started</p>
        </div>
      )}
    </div>
  )
}
