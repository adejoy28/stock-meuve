// reports/page.jsx — Time-period reports with four views
// Period selector and comprehensive reporting sections

'use client'

import { useState, useEffect } from 'react'
import { useStock } from '@/context/StockContext'
import { 
  getReportSummary, 
  getReportByShop, 
  getReportByProduct, 
  getReportSpoils 
} from '@/lib/api'
import { formatNumber, extractArray } from '@/lib/helpers'
const formatCurrency = (num: number) => `₦${new Intl.NumberFormat('en-NG').format(num || 0)}`
import StatCard from '@/components/ui/StatCard'

export default function ReportsPage() {
  const { period, setPeriod, products, shops } = useStock()
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState(true)
  const [summaryData, setSummaryData] = useState(null)
  const [byShopData, setByShopData] = useState([])
  const [byProductData, setByProductData] = useState([])
  const [spoilsData, setSpoilsData] = useState([])

  // Load all report data when period changes
  useEffect(() => {
    loadAllReports()
  }, [period])

  const loadAllReports = async () => {
    setLoading(true)
    try {
      // Load all four reports in parallel
      const [summaryResponse, byShopResponse, byProductResponse, spoilsResponse] = 
        await Promise.all([
          getReportSummary(period),
          getReportByShop(period),
          getReportByProduct(period),
          getReportSpoils(period)
        ])

      setSummaryData(summaryResponse.data)
      setByShopData(extractArray(byShopResponse.data))
      setByProductData(extractArray(byProductResponse.data))
      setSpoilsData(extractArray(spoilsResponse.data))
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const SummarySection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Opening Stock"
          value={formatNumber(summaryData?.total_opening || 0)}
          icon="🌅"
          color="orange"
        />
        <StatCard
          label="Received"
          value={formatNumber(summaryData?.total_received || 0)}
          icon="📥"
          color="green"
        />
        <StatCard
          label="Distributed"
          value={formatNumber(summaryData?.total_distributed || 0)}
          icon="🚚"
          color="yellow"
        />
        <StatCard
          label="Spoiled"
          value={formatNumber(summaryData?.total_spoiled || 0)}
          icon="💔"
          color="red"
        />
        <StatCard
          label="Current Balance"
          value={formatNumber(summaryData?.current_balance || 0)}
          icon="📊"
          color="purple"
        />
      </div>
    </div>
  )

  const ByShopSection = () => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Distribution by Shop</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Distributed
              </th>
              {products.map(product => (
                <th key={product.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {product.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shops.filter(shop => !shop.archived).map(shop => {
              const shopData = byShopData.find(item => item.shop?.id === shop.id)
              const productBreakdown = shopData?.product_breakdown || {}
              
              return (
                <tr key={shop.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-orange-500">
                      {formatNumber(shopData?.total_distributed || 0)}
                    </div>
                  </td>
                  {products.map(product => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatNumber(productBreakdown[product.id] || 0)}
                      </div>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  const ByProductSection = () => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Activity by Product</h3>
      </div>
      <div className="overflow-x-auto">
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
                Received
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distributed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spoiled
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => {
              const productData = byProductData.find(item => item.product?.id === product.id)
              
              return (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{product.sku_code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {formatNumber(productData?.total_received || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-orange-500">
                      {formatNumber(productData?.total_distributed || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">
                      {formatNumber(productData?.total_spoiled || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      product.balance === 0 ? 'text-red-600' :
                      product.balance <= 5 ? 'text-orange-500' : 'text-green-600'
                    }`}>
                      {formatNumber(product.balance)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  const SpoilsSection = () => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Spoils Report</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Damaged
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expired
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Returned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => {
              const spoilData = spoilsData.find(item => item.product?.id === product.id)
              const reasonBreakdown = spoilData?.reason_breakdown || {}
              
              return (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sku_code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-orange-600">
                      {formatNumber(reasonBreakdown.damaged || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-purple-600">
                      {formatNumber(reasonBreakdown.expired || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-yellow-600">
                      {formatNumber(reasonBreakdown.returned || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-red-600">
                      {formatNumber(spoilData?.total_spoiled || 0)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  const tabs = [
    { id: 'summary', label: 'Daily Summary', component: SummarySection },
    { id: 'byShop', label: 'By Shop', component: ByShopSection },
    { id: 'byProduct', label: 'By Product', component: ByProductSection },
    { id: 'spoils', label: 'Spoils Report', component: SpoilsSection }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive reports and analytics</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
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
      <ActiveComponent />
    </div>
  )
}
