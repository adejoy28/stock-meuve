// spoils/page.tsx — Review and action pending spoils
// Shows pending spoil queue with confirm/reject actions and spoil history

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { getMovements, confirmSpoil, rejectSpoil } from '@/lib/api'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import type { Product, Movement } from '@/types'

export default function SpoilsPage() {
  const { refreshProducts, setPendingSpoilsCount, pendingSpoilsCount } = useStock()
  const [pendingSpoils, setPendingSpoils] = useState<Movement[]>([])
  const [historySpoils, setHistorySpoils] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    loadSpoils()
  }, [])

  const loadSpoils = async () => {
    setLoading(true)
    try {
      // Load pending spoils
      const pendingResponse = await getMovements({ type: 'spoil', status: 'pending' })
      console.log('Pending spoils response:', pendingResponse)
      
      let pendingArray = pendingResponse.data
      if (pendingResponse.data && Array.isArray(pendingResponse.data.data)) {
        pendingArray = pendingResponse.data.data
      } else if (pendingResponse.data && Array.isArray(pendingResponse.data)) {
        pendingArray = pendingResponse.data
      } else {
        pendingArray = []
      }
      
      setPendingSpoils(pendingArray)

      // Load confirmed and rejected spoils for history
      const [confirmedResponse, rejectedResponse] = await Promise.all([
        getMovements({ type: 'spoil', status: 'confirmed' }),
        getMovements({ type: 'spoil', status: 'rejected' })
      ])
      
      console.log('Confirmed spoils response:', confirmedResponse)
      console.log('Rejected spoils response:', rejectedResponse)

      // Extract arrays from responses
      let confirmedArray = confirmedResponse.data
      if (confirmedResponse.data && Array.isArray(confirmedResponse.data.data)) {
        confirmedArray = confirmedResponse.data.data
      } else if (confirmedResponse.data && Array.isArray(confirmedResponse.data)) {
        confirmedArray = confirmedResponse.data
      } else {
        confirmedArray = []
      }
      
      let rejectedArray = rejectedResponse.data
      if (rejectedResponse.data && Array.isArray(rejectedResponse.data.data)) {
        rejectedArray = rejectedResponse.data.data
      } else if (rejectedResponse.data && Array.isArray(rejectedResponse.data)) {
        rejectedArray = rejectedResponse.data
      } else {
        rejectedArray = []
      }

      const history = [
        ...confirmedArray,
        ...rejectedArray
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
      console.error('Failed to confirm spoil:', JSON.stringify(error, null, 2))
      console.error('Failed to confirm spoil - response data:', (error as any)?.response?.data)
      console.error('Failed to confirm spoil - status:', (error as any)?.response?.status)
      console.error('Failed to confirm spoil - message:', (error as any)?.message)
      alert('Failed to confirm spoil. Please try again.')
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
      console.error('Failed to reject spoil:', error)
      alert('Failed to reject spoil. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
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
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => handleConfirm(spoil.id)}
              disabled={actionLoading === spoil.id}
              className="bg-white text-red-500 text-sm font-medium rounded-lg h-12 px-5 border border-red-200 w-full active:opacity-70 disabled:opacity-40"
            >
              {actionLoading === spoil.id ? '...' : 'Confirm'}
            </button>
            <button
              onClick={() => handleReject(spoil.id)}
              disabled={actionLoading === spoil.id}
              className="bg-white text-gray-700 text-sm font-medium rounded-lg h-12 px-5 border border-gray-200 w-full active:opacity-70 disabled:opacity-40"
            >
              {actionLoading === spoil.id ? '...' : 'Reject'}
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
