// StockContext — Global state for Charly HB application
// Provides: SKUs, shops, period, modal management, and data sharing across components

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  getProducts, 
  getShops, 
  getMovements,
  getReportSummary 
} from '@/lib/api'
import { ApiErrorHandler } from '@/lib/errorHandler'
import { extractArray } from '@/lib/helpers'
import type { Product, Shop, Movement, ReportSummary } from '@/types'

interface StockContextType {
  // Data
  products: Product[]
  shops: Shop[]
  movements: Movement[]
  reportSummary: ReportSummary | null
  
  // Loading states
  loading: boolean
  productsLoading: boolean
  shopsLoading: boolean
  
  // Period and UI state
  period: string
  setPeriod: (period: string) => void
  activeModal: string | null
  
  // Modal management
  openModal: (modalName: string) => void
  closeModal: () => void
  
  // Pending spoils
  pendingSpoilsCount: number
  setPendingSpoilsCount: (count: number) => void
  
  // Page title
  pageTitle: string
  updatePageTitle: (title: string) => void
  
  // Quick actions
  handleQuickAction: (actionId: string) => void
  
  // Data refresh functions
  refreshProducts: () => Promise<void>
  refreshShops: (includeArchived?: boolean) => Promise<void>
  refreshMovements: () => Promise<void>
  refreshReportSummary: () => Promise<void>
  refreshAllData: () => Promise<void>
}

const StockContext = createContext<StockContextType | undefined>(undefined)

interface StockProviderProps {
  children: ReactNode
}

export function StockProvider({ children }: StockProviderProps) {
  // Data state
  const [products, setProducts] = useState<Product[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null)
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [shopsLoading, setShopsLoading] = useState(false)
  
  // UI state
  const [period, setPeriod] = useState('today')
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [pendingSpoilsCount, setPendingSpoilsCount] = useState(0)
  const [pageTitle, setPageTitle] = useState('Dashboard')

  // Data fetching functions
  const refreshProducts = async () => {
    setProductsLoading(true)
    try {
      const response = await getProducts()
      
;      setProducts(extractArray<Product>(response.data))
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      console.error('Failed to fetch products:', apiError)
      setProducts([]) // Set to empty array on error
    } finally {
      setProductsLoading(false)
    }
  }

  const refreshShops = async (includeArchived = false) => {
    setShopsLoading(true)
    try {
      const response = await getShops(includeArchived)
      
      setShops(extractArray<Shop>(response.data))
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      console.error('Failed to fetch shops:', apiError)
      setShops([])
    } finally {
      setShopsLoading(false)
    }
  }

  const refreshMovements = async () => {
    try {
      const response = await getMovements({ limit: 50 })
      
      setMovements(extractArray<Movement>(response.data))
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      console.error('Failed to fetch movements:', apiError)
      setMovements([])
    }
  }

  const refreshReportSummary = async () => {
    try {
      const response = await getReportSummary({ period })
      // Report summary is an object, not an array, so handle it differently
      setReportSummary(response.data)
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error)
      console.error('Failed to fetch report summary:', apiError)
    }
  }

  const refreshAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        refreshProducts(),
        refreshShops(),
        refreshMovements(),
        refreshReportSummary()
      ])
      
      // Count pending spoils
      const pendingResponse = await getMovements({ status: 'pending' })
      
      const pendingArray = extractArray<Movement>(pendingResponse.data)
      setPendingSpoilsCount(pendingArray.length)
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Modal management
  const openModal = (modalName: string) => {
    setActiveModal(modalName)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  // Handle quick action from QuickActions component
  const handleQuickAction = (actionId: string) => {
    openModal(actionId)
  }

  // Update page title based on current route
  const updatePageTitle = (title: string) => {
    setPageTitle(title)
  }

  // Load initial data on mount
  useEffect(() => {
    refreshAllData()
  }, [])

  // Refresh report summary when period changes
  useEffect(() => {
    refreshReportSummary()
  }, [period])

  return (
    <StockContext.Provider
      value={{
        // Data
        products,
        shops,
        movements,
        reportSummary,
        
        // Loading states
        loading,
        productsLoading,
        shopsLoading,
        
        // Period and UI state
        period,
        setPeriod,
        activeModal,
        
        // Modal management
        openModal,
        closeModal,
        
        // Pending spoils
        pendingSpoilsCount,
        setPendingSpoilsCount,
        
        // Page title
        pageTitle,
        updatePageTitle,
        
        // Quick actions
        handleQuickAction,
        
        // Data refresh functions
        refreshProducts,
        refreshShops,
        refreshMovements,
        refreshReportSummary,
        refreshAllData,
      }}
    >
      {children}
    </StockContext.Provider>
  )
}

export function useStock() {
  const context = useContext(StockContext)
  if (!context) {
    throw new Error('useStock must be used within a StockProvider')
  }
  return context
}
