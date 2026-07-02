import axiosInstance from './axiosInstance'
import { DashboardKPIs, InventoryTrend, TopConsumedIngredient } from '@/types'

export const dashboardApi = {
  getKPIs: (kitchenId?: string) =>
    axiosInstance.get<DashboardKPIs>('/dashboard/kpis', { params: { kitchenId } }).then(r => r.data),

  getInventoryTrends: (kitchenId?: string, days = 30) =>
    axiosInstance.get<InventoryTrend[]>('/dashboard/inventory-trends', { params: { kitchenId, days } }).then(r => r.data),

  getTopConsumed: (kitchenId?: string, limit = 10) =>
    axiosInstance.get<TopConsumedIngredient[]>('/dashboard/top-consumed', { params: { kitchenId, limit } }).then(r => r.data),

  getWasteAnalysis: (kitchenId?: string, days = 30) =>
    axiosInstance.get('/dashboard/waste-analysis', { params: { kitchenId, days } }).then(r => r.data),

  getLowStockAlerts: () =>
    axiosInstance.get('/dashboard/low-stock-alerts').then(r => r.data),
}
