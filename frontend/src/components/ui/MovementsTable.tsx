// MovementsTable.tsx — Table of movement records with type badge
// Props: movements (array), loading (boolean)

import React from 'react'
import TypeBadge from './TypeBadge'
import type { Product, Shop, Movement } from '@/types'

interface MovementsTableProps {
  movements: Movement[]
  loading: boolean
}

export default function MovementsTable({ movements, loading }: MovementsTableProps) {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Movements</h3>
        </div>
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No movements recorded yet</h3>
          <p className="text-sm text-gray-500">Start by recording opening stock or receiving goods</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-4 border-b border-gray-200">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Movements</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop / Note
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {formatDate(movement.recorded_at)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {formatTime(movement.recorded_at)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {movement.product?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {movement.product?.sku_code || ''}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <TypeBadge type={movement.type} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    movement.qty > 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {movement.qty > 0 ? '+' : ''}{formatNumber(movement.qty)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {movement.shop?.name || movement.note || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {movement.status && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      movement.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      movement.status === 'rejected' ? 'bg-red-50 text-red-500' :
                      movement.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {movement.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
