import axiosInstance from './axiosInstance'

export interface CategoryPayload {
  name: string
  code: string
  description?: string
  parentId?: string | null
}

export interface UnitOfMeasurePayload {
  name: string
  abbreviation: string
  type: string
  baseConversionFactor: number
  baseUnit: string
}

export interface WarehousePayload {
  name: string
  code: string
  storageType: string
  location?: string
  capacity?: number
  capacityUnit?: string
  temperatureMin?: number
  temperatureMax?: number
  kitchenId: string
}

export interface KitchenPayload {
  name: string
  code: string
  location?: string
  contactEmail?: string
  contactPhone?: string
  description?: string
}

export const categoriesApi = {
  getAll: () => axiosInstance.get('/categories').then(r => r.data),
  create: (data: CategoryPayload) => axiosInstance.post('/categories', data).then(r => r.data),
  update: (id: string, data: CategoryPayload) => axiosInstance.put(`/categories/${id}`, data).then(r => r.data),
  delete: (id: string) => axiosInstance.delete(`/categories/${id}`).then(r => r.data),
}

export const unitsOfMeasureApi = {
  getAll: () => axiosInstance.get('/units-of-measure').then(r => r.data),
  create: (data: UnitOfMeasurePayload) => axiosInstance.post('/units-of-measure', data).then(r => r.data),
  update: (id: string, data: UnitOfMeasurePayload) => axiosInstance.put(`/units-of-measure/${id}`, data).then(r => r.data),
  delete: (id: string) => axiosInstance.delete(`/units-of-measure/${id}`).then(r => r.data),
}

export const warehousesApi = {
  getAll: () => axiosInstance.get('/warehouses').then(r => r.data),
  create: (data: WarehousePayload) => axiosInstance.post('/warehouses', data).then(r => r.data),
  update: (id: string, data: WarehousePayload) => axiosInstance.put(`/warehouses/${id}`, data).then(r => r.data),
  delete: (id: string) => axiosInstance.delete(`/warehouses/${id}`).then(r => r.data),
}

export const kitchensApi = {
  getAll: () => axiosInstance.get('/kitchens').then(r => r.data),
  create: (data: KitchenPayload) => axiosInstance.post('/kitchens', data).then(r => r.data),
  update: (id: string, data: KitchenPayload) => axiosInstance.put(`/kitchens/${id}`, data).then(r => r.data),
  delete: (id: string) => axiosInstance.delete(`/kitchens/${id}`).then(r => r.data),
}
