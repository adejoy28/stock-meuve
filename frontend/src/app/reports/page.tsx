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
      
      // Extract arrays from responses
      let byShopArray = byShopResponse.data
      if (byShopResponse.data && Array.isArray(byShopResponse.data.data)) {
        byShopArray = byShopResponse.data.data
      } else if (byShopResponse.data && Array.isArray(byShopResponse.data)) {
        byShopArray = byShopResponse.data
      } else {
        byShopArray = []
      }
      setByShopData(byShopArray)
      
      let byProductArray = byProductResponse.data
      if (byProductResponse.data && Array.isArray(byProductResponse.data.data)) {
        byProductArray = byProductResponse.data.data
      } else if (byProductResponse.data && Array.isArray(byProductResponse.data)) {
        byProductArray = byProductResponse.data
      } else {
        byProductArray = []
      }
      setByProductData(byProductArray)
      
      let spoilsArray = spoilsResponse.data
      if (spoilsResponse.data && Array.isArray(spoilsResponse.data.data)) {
        spoilsArray = spoilsResponse.data.data
      } else if (spoilsResponse.data && Array.isArray(spoilsResponse.data)) {
        spoilsArray = spoilsResponse.data
      } else {
        spoilsArray = []
      }
      setSpoilsData(spoilsArray)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0)
  }

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num || 0)
  }

  const SummarySection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Opening Stock"
          value={formatNumber(summaryData?.total_opening || 0)}
          icon="🌅"
          color="blue"
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
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
                <tr key={shop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
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
                <tr key={product.id} className="hover:bg-gray-50">
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
                    <div className="text-sm font-medium text-blue-600">
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
                      product.balance <= 5 ? 'text-yellow-600' : 'text-green-600'
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
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
                <tr key={product.id} className="hover:bg-gray-50">
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
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive reports and analytics</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
