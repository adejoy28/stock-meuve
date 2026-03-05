// api.ts — All API calls with centralized error handling
// Import this file in any component that needs data, never use Axios directly

import axios from 'axios'
import { ApiErrorHandler } from './errorHandler'

// Base Axios instance — all API calls go through this
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't throw here, let individual calls handle errors
    return Promise.reject(error)
  }
)

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
export const getReportSummary = (period: string) => api.get('/reports/summary', { params: { period } }).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const getReportByShop = (period: string) => api.get('/reports/by-shop', { params: { period } }).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const getReportByProduct = (period: string) => api.get('/reports/by-product', { params: { period } }).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export const getReportSpoils = (period: string) => api.get('/reports/spoils', { params: { period } }).catch(error => {
  throw ApiErrorHandler.handleError(error)
})

export default api
