import axiosInstance from './axiosInstance'
import { Ingredient, IngredientRequest, PagedResponse, StorageType } from '@/types'

interface IngredientFilters {
  search?: string
  categoryId?: string
  storageType?: StorageType
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export const ingredientsApi = {
  getAll: (filters: IngredientFilters = {}) =>
    axiosInstance.get<PagedResponse<Ingredient>>('/ingredients', { params: filters }).then(r => r.data),

  getById: (id: string) =>
    axiosInstance.get<Ingredient>(`/ingredients/${id}`).then(r => r.data),

  create: (data: IngredientRequest) =>
    axiosInstance.post<Ingredient>('/ingredients', data).then(r => r.data),

  update: (id: string, data: IngredientRequest) =>
    axiosInstance.put<Ingredient>(`/ingredients/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    axiosInstance.delete(`/ingredients/${id}`).then(r => r.data),

  getLowStock: () =>
    axiosInstance.get<Ingredient[]>('/ingredients/low-stock').then(r => r.data),
}
