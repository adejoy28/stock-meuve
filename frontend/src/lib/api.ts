// api.ts — All API calls with centralized error handling
// Import this file in any component that needs data, never use Axios directly

import axios from 'axios'
import { ApiErrorHandler } from './errorHandler'

// Add at top after imports
let currentIdempotencyKey: string | null = null

// Export functions to set/clear the key
export function setIdempotencyKey(key: string) {
  currentIdempotencyKey = key
}

export function clearIdempotencyKey() {
  currentIdempotencyKey = null
}

// Base Axios instance — all API calls go through this
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60 seconds — show error instead of hanging forever
  // timeout: 15000, // 15 seconds — show error instead of hanging forever
})

// Request interceptor for idempotency key and auth token
api.interceptors.request.use((config) => {
  // Attach idempotency key if present
  if (currentIdempotencyKey && ['post', 'put', 'patch'].includes(config.method || '')) {
    config.headers['X-Idempotency-Key'] = currentIdempotencyKey
  }

  // Attach auth token from localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('charly_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}` 
    }
  }

  return config
})

// Response interceptor for error handling and 401 redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - redirect to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('charly_token')
      localStorage.removeItem('charly_user')
      window.location.href = '/login'
    }
    // Don't throw here, let individual calls handle errors
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────

export const registerUser = (data: {
  name: string
  email?: string
  username?: string
  phone?: string
  password: string
  password_confirmation: string
}) => api.post('/auth/register', data).catch(error => { throw ApiErrorHandler.handleError(error) })

export const loginUser = (data: {
  login: string
  password: string
}) => api.post('/auth/login', data).catch(error => { throw ApiErrorHandler.handleError(error) })

export const logoutUser = () =>
  api.post('/auth/logout').catch(error => { throw ApiErrorHandler.handleError(error) })

export const getMe = () =>
  api.get('/auth/me').catch(error => { throw ApiErrorHandler.handleError(error) })

// ── Products ──
export const getProducts = () => api.get('/products').catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const createProduct = (data: any) => api.post('/products', data).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const updateProduct = (id: number, data: any) => api.put(`/products/${id}`, data).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const deleteProduct = (id: number) => api.delete(`/products/${id}`).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

// ── Shops ──
export const getShops = (includeArchived = false) => api.get('/shops', { 
  params: includeArchived ? { include_archived: 1 } : {} 
}).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const createShop = (data: any) => api.post('/shops', data).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const updateShop = (id: number, data: any) => api.put(`/shops/${id}`, data).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const archiveShop = (id: number) => api.delete(`/shops/${id}`).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

// ── Movements ──
export const getMovements = (params?: any) => api.get('/movements', { 
  params: {
    ...params,
    // Convert sku_id to product_id if present
    ...(params?.sku_id && { product_id: params.sku_id }),
    // Remove sku_id from params to avoid confusion
    ...(params?.sku_id && { sku_id: undefined })
  }
}).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const recordOpening = (data: any) => api.post('/movements/opening', data).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const recordReceipt = (data: any) => api.post('/movements/receipt', data).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const recordDistribution = (data: any) => api.post('/movements/distribution', data).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const recordCorrection = (data: any) => api.post('/movements/correction', data).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const recordSpoil = (data: any) => api.post('/movements/spoil', data).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const confirmSpoil = (id: number) => api.put(`/movements/spoil/${id}/confirm`).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const rejectSpoil = (id: number) => api.put(`/movements/spoil/${id}/reject`).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

// ── Reports ──
export const getReportSummary = (params: Record<string, string | undefined>) => api.get('/reports/summary', { params }).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const getReportByShop = (params: Record<string, string | undefined>) => api.get('/reports/by-shop', { params }).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const getReportByProduct = (params: Record<string, string | undefined>) => api.get('/reports/by-product', { params }).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const getReportSpoils = (params: Record<string, string | undefined>) => api.get('/reports/spoils', { params }).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export default api
