// src/types/index.ts — Shared type definitions for Stockmeuve application
// Single source of truth for all data interfaces

export interface Product {
  id: number
  name: string
  sku_code: string
  cost_price: number
  balance: number
}

export interface Shop {
  id: number
  name: string
  archived: boolean
  total_distributed: number
}

export interface Movement {
  id: number
  type: 'opening' | 'receipt' | 'distribution' | 'correction' | 'spoil'
  qty: number
  status: 'pending' | 'confirmed' | 'rejected'
  reason?: string
  note?: string
  recorded_at: string
  product: {
    id: number
    name: string
    sku_code: string
  }
  shop?: {
    id: number
    name: string
  }
}

export interface ReportSummary {
  period: string
  total_opening: number
  total_received: number
  total_distributed: number
  total_spoiled: number
  current_balance: number
}
