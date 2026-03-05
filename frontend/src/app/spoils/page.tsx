// spoils/page.tsx — Review and action pending spoils
// Shows pending spoil queue with confirm/reject actions and spoil history

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { getMovements, confirmSpoil, rejectSpoil } from '@/lib/api'
import { formatDate, formatTime, formatNumber, extractArray } from '@/lib/helpers'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import type { Product, Movement } from '@/types'

export default function SpoilsPage() {
  const { refreshProducts, setPendingSpoilsCount, pendingSpoilsCount } = useStock()
  const [pendingSpoils, setPendingSpoils] = useState<Movement[]>([])
  const [historySpoils, setHistorySpoils] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    loadSpoils()
  }, [])

  const loadSpoils = async () => {
    setLoading(true)
    try {
      // Load pending spoils
      const pendingResponse = await getMovements({ type: 'spoil', status: 'pending' })
      
      setPendingSpoils(extractArray<Movement>(pendingResponse.data))

      // Load confirmed and rejected spoils for history
      const [confirmedResponse, rejectedResponse] = await Promise.all([
        getMovements({ type: 'spoil', status: 'confirmed' }),
        getMovements({ type: 'spoil', status: 'rejected' })
      ])

      const history = [
        ...extractArray<Movement>(confirmedResponse.data),
        ...extractArray<Movement>(rejectedResponse.data)
      ].sort((a: Movement, b: Movement) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())

      setHistorySpoils(history)
    } catch (error) {
      console.error('Failed to load spoils:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (spoilId: number) => {
    setActionLoading(spoilId)
    try {
      await confirmSpoil(spoilId)
      
      // Move from pending to history
      const confirmedSpoil = pendingSpoils.find(s => s.id === spoilId)
      if (confirmedSpoil) {
        setPendingSpoils(prev => prev.filter(s => s.id !== spoilId))
        setHistorySpoils(prev => [{ ...confirmedSpoil, status: 'confirmed' }, ...prev])
      }

      await refreshProducts()
      setPendingSpoilsCount(pendingSpoilsCount - 1)
    } catch (error) {
      setActionError('Failed to confirm spoil. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (spoilId: number) => {
    setActionLoading(spoilId)
    try {
      await rejectSpoil(spoilId)
      
      // Move from pending to history
      const rejectedSpoil = pendingSpoils.find(s => s.id === spoilId)
      if (rejectedSpoil) {
        setPendingSpoils(prev => prev.filter(s => s.id !== spoilId))
        setHistorySpoils(prev => [{ ...rejectedSpoil, status: 'rejected' }, ...prev])
      }

      setPendingSpoilsCount(pendingSpoilsCount - 1)
    } catch (error) {
      setActionError('Failed to reject spoil. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const getReasonLabel = (reason: string) => {
    const labels = {
      damaged: 'Damaged',
      expired: 'Expired',
      returned: 'Returned'
    }
    return labels[reason as keyof typeof labels] || reason
  }

  const SpoilRow = ({ spoil, showActions = false }: { spoil: Movement; showActions?: boolean }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <h4 className="font-medium text-gray-900 text-sm">
              {spoil.product?.name || 'Unknown Product'}
            </h4>
            <span className="text-sm text-gray-400">
              ({spoil.product?.sku_code || ''})
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              spoil.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
              spoil.status === 'confirmed' ? 'bg-red-50 text-red-500' :
              spoil.status === 'rejected' ? 'bg-gray-100 text-gray-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {spoil.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Quantity:</span>
              <span className="ml-2 font-medium text-red-500">
                {formatNumber(Math.abs(spoil.qty))} units
              </span>
            </div>
            <div>
              <span className="text-gray-500">Reason:</span>
              <span className="ml-2 font-medium text-gray-700">
                {getReasonLabel(spoil.reason || '')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <span className="ml-2 text-gray-700">
                {formatDate(spoil.recorded_at)} at {formatTime(spoil.recorded_at)}
              </span>
            </div>
            {spoil.note && (
              <div>
                <span className="text-gray-500">Note:</span>
                <span className="ml-2 text-gray-700">{spoil.note}</span>
              </div>
            )}
          </div>
        </div>

        {showActions && spoil.status === 'pending' && (
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleConfirm(spoil.id)}
              disabled={actionLoading === spoil.id}
              className="w-full h-12 bg-white text-red-500 text-sm font-medium rounded-lg border border-red-200 active:opacity-70 disabled:opacity-40"
            >
              {actionLoading === spoil.id ? 'Processing...' : 'Confirm Deduction'}
            </button>
            <button
              onClick={() => handleReject(spoil.id)}
              disabled={actionLoading === spoil.id}
              className="w-full h-12 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg active:opacity-70 disabled:opacity-40"
            >
              {actionLoading === spoil.id ? 'Processing...' : 'Reject'}
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="px-4 py-4 space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Spoils Queue</h1>
        <p className="text-sm text-gray-700 mt-2">Review and action pending spoiled items</p>
      </div>

      {/* Pending Spoils Queue */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
          Pending Spoils ({pendingSpoils.length})
        </h3>
        
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-12 animate-pulse"></div>
            ))}
          </div>
        ) : pendingSpoils.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No pending spoils</h3>
            <p className="text-sm text-gray-500">All spoils have been reviewed. You're all clear!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSpoils.map((spoil) => (
              <SpoilRow key={spoil.id} spoil={spoil} showActions={true} />
            ))}
          </div>
        )}
      </div>

      {/* History Section */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
          History ({historySpoils.length})
        </h3>
        
        {historySpoils.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3"></div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No history yet</h3>
            <p className="text-sm text-gray-500">Confirmed and rejected spoils will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historySpoils.map((spoil) => (
              <SpoilRow key={spoil.id} spoil={spoil} showActions={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
