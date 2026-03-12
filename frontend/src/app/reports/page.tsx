// reports/page.tsx — Period reports with filter bar and mobile-first design
'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import {
  getReportSummary,
  getReportByShop,
  getReportByProduct,
  getReportSpoils
} from '@/lib/api'
import { formatNumber, formatCurrency, extractArray } from '@/lib/helpers'
import StatCard from '@/components/ui/StatCard'
import type { ReportSummary } from '@/types'

export default function ReportsPage() {
  const { period, setPeriod, products, shops } = useStock()
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const [summaryData, setSummaryData] = useState<ReportSummary | null>(null)
  const [byShopData, setByShopData] = useState<any[]>([])
  const [byProductData, setByProductData] = useState<any[]>([])
  const [spoilsData, setSpoilsData] = useState<any[]>([])

  const isCustomRange = !!(customFrom && customTo)

  const filterLabel = isCustomRange
    ? `${customFrom} → ${customTo}` 
    : period.charAt(0).toUpperCase() + period.slice(1)

  useEffect(() => {
    loadAllReports()
  }, [period, customFrom, customTo])

  const loadAllReports = async () => {
    setLoading(true)
    try {
      const params = isCustomRange
        ? { from: customFrom, to: customTo }
        : { period }

      const [summaryRes, byShopRes, byProductRes, spoilsRes] = await Promise.all([
        getReportSummary(params),
        getReportByShop(params),
        getReportByProduct(params),
        getReportSpoils(params),
      ])

      setSummaryData(summaryRes.data as ReportSummary)
      setByShopData(extractArray(byShopRes.data))
      setByProductData(extractArray(byProductRes.data))
      setSpoilsData(extractArray(spoilsRes.data))
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  // ─── Summary Section ────────────────────────────────────────────────────────

  const SummarySection = () => {
    const totalStockValue = products.reduce(
      (sum, p) => sum + (p.cost_price || 0) * (p.balance || 0),
      0
    )

    return (
      <div className="space-y-4">
        {/* Stat grid — 2 col on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Opening" value={summaryData?.total_opening || 0} color="orange" />
          <StatCard label="Received" value={summaryData?.total_received || 0} color="green" />
          <StatCard label="Distributed" value={Math.abs(summaryData?.total_distributed || 0)} color="orange" />
          <StatCard label="Spoiled" value={summaryData?.total_spoiled || 0} color="red" />
          <StatCard label="Balance" value={summaryData?.current_balance || 0} color="green" />
        </div>

        {/* Total stock value */}
        {totalStockValue > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Total Stock Value
            </p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStockValue)}</p>
            <p className="text-xs text-gray-400 mt-1">cost price × current balance</p>
          </div>
        )}
      </div>
    )
  }

  // ─── By Shop Section ─────────────────────────────────────────────────────────
  // Backend returns: { shop: {id, name}, total_distributed, movements[] }
  // Build per-product breakdown from movements[]

  const ByShopSection = () => {
    const activeShops = shops.filter(s => !s.archived)

    return (
      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Distribution by Shop
        </p>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {activeShops.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-sm text-gray-400">No shops yet</p>
            </div>
          )}
          {activeShops.map(shop => {
            const shopData = byShopData.find(item => item.shop?.id === shop.id)
            const movements: any[] = shopData?.movements || []
            const totalCartons = movements.reduce((sum: number, m: any) => sum + Math.abs(m.qty), 0)

            // Group movements by product
            const byProduct: Record<number, { name: string; qty: number; cost_price: number }> = {}
            movements.forEach((m: any) => {
              const pid = m.product_id
              if (!byProduct[pid]) {
                byProduct[pid] = {
                  name: m.product?.name || '',
                  qty: 0,
                  cost_price: m.product?.cost_price || 0,
                }
              }
              byProduct[pid].qty += Math.abs(m.qty)
            })

            const totalValue = Object.values(byProduct).reduce(
              (sum, p) => sum + p.qty * p.cost_price, 0
            )

            return (
              <div key={shop.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">{shop.name}</p>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-500">
                      {formatNumber(totalCartons)}
                      <span className="text-xs font-normal text-gray-400 ml-1">cartons</span>
                    </p>
                    {totalValue > 0 && (
                      <p className="text-xs font-medium text-gray-600">{formatCurrency(totalValue)}</p>
                    )}
                  </div>
                </div>
                {Object.entries(byProduct).length > 0 ? (
                  Object.entries(byProduct).map(([pid, data]) => (
                    <div key={pid} className="flex justify-between items-center py-1.5 border-t border-gray-50">
                      <span className="text-xs text-gray-500">{data.name}</span>
                      <div className="text-right">
                        <span className="text-xs font-medium text-gray-700">{formatNumber(data.qty)}</span>
                        {data.cost_price > 0 && (
                          <span className="text-xs text-gray-400 ml-2">
                            {formatCurrency(data.qty * data.cost_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 border-t border-gray-50 pt-2">
                    No distributions in this period
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide sticky left-0 bg-gray-50 z-10 min-w-[140px]">
                      Shop
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Total Cartons
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Total Value
                    </th>
                    {products.map(p => (
                      <th key={p.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeShops.map(shop => {
                    const shopData = byShopData.find(item => item.shop?.id === shop.id)
                    const movements: any[] = shopData?.movements || []

                    // Build product qty map from movements
                    const productQty: Record<number, number> = {}
                    movements.forEach((m: any) => {
                      productQty[m.product_id] = (productQty[m.product_id] || 0) + Math.abs(m.qty)
                    })

                    const totalCartons = Object.values(productQty).reduce((a, b) => a + b, 0)
                    const totalValue = products.reduce((sum, p) => {
                      return sum + (productQty[p.id] || 0) * (p.cost_price || 0)
                    }, 0)

                    return (
                      <tr key={shop.id}>
                        <td className="px-4 py-3 sticky left-0 bg-white z-10">
                          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{shop.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-orange-500">{formatNumber(totalCartons)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-700">
                            {totalValue > 0 ? formatCurrency(totalValue) : '—'}
                          </span>
                        </td>
                        {products.map(p => (
                          <td key={p.id} className="px-4 py-3">
                            <span className="text-sm text-gray-700">{formatNumber(productQty[p.id] || 0)}</span>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    )
  }

  // ─── By Product Section ──────────────────────────────────────────────────────
  // Backend returns: { product: {id, name, sku_code}, received, distributed, spoiled, balance }

  const ByProductSection = () => (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Activity by Product</p>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {products.map(product => {
          const productData = byProductData.find(item => item.product?.id === product.id)
          const received = productData?.total_received || 0
          const distributed = Math.abs(productData?.total_distributed || 0)
          const spoiled = productData?.total_spoiled || 0

          return (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.sku_code}</p>
                </div>
                <div className={`text-lg font-bold ${
                  product.balance === 0 ? 'text-red-500' :
                  product.balance <= 5 ? 'text-orange-500' : 'text-green-600'
                }`}>
                  {formatNumber(product.balance)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Received</p>
                  <p className="text-sm font-semibold text-green-600">{formatNumber(received)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Distributed</p>
                  <p className="text-sm font-semibold text-orange-500">{formatNumber(distributed)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Spoiled</p>
                  <p className="text-sm font-semibold text-red-500">{formatNumber(spoiled)}</p>
                </div>
              </div>
              {/* Use stored values — not computed from current product price */}
              {productData?.total_selling_value > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Revenue</span>
                    <span className="text-xs font-semibold text-orange-500">
                      {formatCurrency(productData.total_selling_value)}
                    </span>
                  </div>
                  {productData.total_cost_value > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Cost</span>
                      <span className="text-xs text-gray-500">
                        {formatCurrency(productData.total_cost_value)}
                      </span>
                    </div>
                  )}
                  {productData.gross_margin > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Margin</span>
                      <span className="text-xs font-semibold text-green-600">
                        {formatCurrency(productData.gross_margin)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide sticky left-0 bg-gray-50 z-10 min-w-[140px]">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Received
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Distributed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Spoiled
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => {
                  const productData = byProductData.find(item => item.product?.id === product.id)
                  const received = productData?.total_received || 0
                  const distributed = Math.abs(productData?.total_distributed || 0)
                  const spoiled = productData?.total_spoiled || 0

                  return (
                    <tr key={product.id}>
                      <td className="px-4 py-3 sticky left-0 bg-white z-10">
                        <p className="text-sm font-medium text-gray-900 whitespace-nowrap">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku_code}</p>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-green-600 font-medium">{formatNumber(received)}</span></td>
                      <td className="px-4 py-3"><span className="text-sm text-orange-500 font-medium">{formatNumber(distributed)}</span></td>
                      <td className="px-4 py-3"><span className="text-sm text-red-500 font-medium">{formatNumber(spoiled)}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${
                          product.balance === 0 ? 'text-red-500' :
                          product.balance <= 5 ? 'text-orange-500' : 'text-green-600'
                        }`}>
                          {formatNumber(product.balance)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-orange-500">
                          {productData?.total_selling_value ? formatCurrency(productData.total_selling_value) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {productData?.total_cost_value ? formatCurrency(productData.total_cost_value) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-green-600">
                          {productData?.gross_margin ? formatCurrency(productData.gross_margin) : '—'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  )

  // ─── Spoils Section ──────────────────────────────────────────────────────────
  // Backend returns: { product: {id, name, sku_code}, damaged_qty, expired_qty, returned_qty, total }

  const SpoilsSection = () => (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Spoils Report</p>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {spoilsData.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">No spoils recorded in this period</p>
          </div>
        )}
        {spoilsData.map(spoil => (
          <div key={spoil.product?.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{spoil.product?.name}</p>
                <p className="text-xs text-gray-400">{spoil.product?.sku_code}</p>
              </div>
              <p className="text-lg font-bold text-red-500">
                {formatNumber(spoil.total || 0)}
                <span className="text-xs font-normal text-gray-400 ml-1">total</span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-400">Damaged</p>
                <p className="text-sm font-semibold text-orange-500">{formatNumber(spoil.damaged_qty || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Expired</p>
                <p className="text-sm font-semibold text-red-500">{formatNumber(spoil.expired_qty || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Returned</p>
                <p className="text-sm font-semibold text-gray-500">{formatNumber(spoil.returned_qty || 0)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Damaged
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Expired
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Returned
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {spoilsData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                  No spoils recorded in this period
                </td>
              </tr>
            )}
            {spoilsData.map(spoil => (
              <tr key={spoil.product?.id}>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{spoil.product?.name}</p>
                  <p className="text-xs text-gray-400">{spoil.product?.sku_code}</p>
                </td>
                <td className="px-4 py-3"><span className="text-sm font-medium text-orange-500">{formatNumber(spoil.damaged_qty || 0)}</span></td>
                <td className="px-4 py-3"><span className="text-sm font-medium text-red-500">{formatNumber(spoil.expired_qty || 0)}</span></td>
                <td className="px-4 py-3"><span className="text-sm font-medium text-gray-500">{formatNumber(spoil.returned_qty || 0)}</span></td>
                <td className="px-4 py-3"><span className="text-sm font-bold text-red-600">{formatNumber(spoil.total || 0)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ─── Tabs ────────────────────────────────────────────────────────────────────

  const tabs = [
    { id: 'summary', label: 'Summary', component: SummarySection },
    { id: 'byShop', label: 'By Shop', component: ByShopSection },
    { id: 'byProduct', label: 'By Product', component: ByProductSection },
    { id: 'spoils', label: 'Spoils', component: SpoilsSection },
  ]

  // ─── Loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Filter bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
            {isCustomRange ? 'Custom range' : `Period: ${period}`}
          </p>
          <div className="flex items-center gap-2">
            {isCustomRange && (
              <button
                onClick={() => { setCustomFrom(''); setCustomTo('') }}
                className="text-xs text-orange-500 active:opacity-70"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border active:opacity-70 ${
                isCustomRange
                  ? 'border-orange-500 text-orange-500 bg-orange-50'
                  : 'border-gray-200 text-gray-600 bg-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {filterLabel}
            </button>
          </div>
        </div>

        {/* Collapsible filter panel */}
        {filterOpen && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">

            {/* Quick period pills */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quick range</p>
              <div className="flex gap-2 flex-wrap">
                {['today', 'week', 'month', 'all'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p)
                      setCustomFrom('')
                      setCustomTo('')
                    }}
                    className={`text-xs font-medium rounded-full px-3 py-1.5 active:opacity-70 ${
                      period === p && !isCustomRange
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom date range */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Custom range</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">To</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setFilterOpen(false)}
              className="w-full h-10 bg-orange-500 text-white text-sm font-medium rounded-lg active:opacity-70"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation — scrollable on mobile */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <nav className="flex border-b border-gray-200 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap active:opacity-70 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Active Tab Content */}
      {ActiveComponent && <ActiveComponent />}
    </div>
  )
}
