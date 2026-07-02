import axiosInstance from './axiosInstance'
import { PagedResponse, StockAdjustmentRequest, StockItem, StockTransaction } from '@/types'

interface StockFilters {
  warehouseId?: string
  ingredientId?: string
  page?: number
  size?: number
}

interface TransactionFilters {
  ingredientId?: string
  type?: string
  fromDate?: string
  toDate?: string
  page?: number
  size?: number
}

export const inventoryApi = {
  getStock: (filters: StockFilters = {}) =>
    axiosInstance.get<PagedResponse<StockItem>>('/inventory/stock', { params: filters }).then(r => r.data),

  getExpiringStock: (days = 7) =>
    axiosInstance.get<StockItem[]>('/inventory/expiring', { params: { days } }).then(r => r.data),

  stockIn: (data: StockAdjustmentRequest) =>
    axiosInstance.post('/inventory/stock-in', data).then(r => r.data),

  stockOut: (data: StockAdjustmentRequest) =>
    axiosInstance.post('/inventory/stock-out', data).then(r => r.data),

  adjustment: (data: StockAdjustmentRequest) =>
    axiosInstance.post('/inventory/adjustment', data).then(r => r.data),

  getTransactions: (filters: TransactionFilters = {}) =>
    axiosInstance.get<PagedResponse<StockTransaction>>('/inventory/transactions', { params: filters }).then(r => r.data),
}
