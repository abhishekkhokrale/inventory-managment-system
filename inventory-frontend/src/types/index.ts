// ============================================================
// Core Type Definitions
// ============================================================

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  active: boolean
}

// --- Auth Types ---
export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: string
  username: string
  email: string
  fullName: string
  roles: string[]
  permissions: string[]
}

export interface AuthUser {
  userId: string
  username: string
  email: string
  fullName: string
  roles: string[]
  permissions: string[]
}

// --- Pagination ---
export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface PaginationParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

// --- Kitchen & Warehouse ---
export interface Kitchen extends BaseEntity {
  name: string
  code: string
  location: string
  contactEmail: string
  contactPhone: string
  description: string
}

export interface Warehouse extends BaseEntity {
  name: string
  code: string
  storageType: StorageType
  location: string
  capacity: number
  capacityUnit: string
  temperatureMin: number
  temperatureMax: number
  kitchenId: string
}

// --- User Management ---
export interface User extends BaseEntity {
  username: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  avatarUrl: string
  verified: boolean
  locked: boolean
  lastLogin: string
  roles: Role[]
  kitchen: Kitchen
}

export interface Role extends BaseEntity {
  name: RoleName
  description: string
  permissions: Permission[]
}

export interface Permission extends BaseEntity {
  name: string
  description: string
  module: string
}

// --- Category & UOM ---
export interface Category extends BaseEntity {
  name: string
  code: string
  description: string
  parent?: Category
  children?: Category[]
}

export interface UnitOfMeasure extends BaseEntity {
  name: string
  abbreviation: string
  type: string
  baseConversionFactor: number
  baseUnit: string
}

// --- Ingredient ---
export interface Ingredient extends BaseEntity {
  name: string
  code: string
  description: string
  category: Category
  unitOfMeasure: UnitOfMeasure
  shelfLifeDays: number
  reorderLevel: number
  minimumStock: number
  maximumStock: number
  storageType: StorageType
  standardCost: number
  barcode: string
  qrCode: string
  imageUrl: string
  allergens: string
  perishable: boolean
  trackBatch: boolean
  trackExpiry: boolean
}

export interface IngredientRequest {
  name: string
  code: string
  description?: string
  categoryId: string
  unitOfMeasureId: string
  shelfLifeDays?: number
  reorderLevel?: number
  minimumStock?: number
  maximumStock?: number
  storageType: StorageType
  standardCost?: number
  barcode?: string
  allergens?: string
  perishable?: boolean
  trackBatch?: boolean
  trackExpiry?: boolean
}

// --- Supplier ---
export interface Supplier extends BaseEntity {
  name: string
  code: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  taxNumber: string
  paymentTerms: string
  leadTimeDays: number
  rating: number
  website: string
  notes: string
  contacts: SupplierContact[]
}

export interface SupplierContact extends BaseEntity {
  name: string
  designation: string
  email: string
  phone: string
  primary: boolean
}

// --- Purchase ---
export interface PurchaseOrder extends BaseEntity {
  orderNumber: string
  kitchen: Kitchen
  supplier: Supplier
  orderDate: string
  expectedDeliveryDate: string
  status: PurchaseStatus
  totalAmount: number
  taxAmount: number
  discountAmount: number
  paymentTerms: string
  deliveryAddress: string
  remarks: string
  items: PurchaseOrderItem[]
}

export interface PurchaseOrderItem extends BaseEntity {
  ingredient: Ingredient
  quantityOrdered: number
  quantityReceived: number
  unitOfMeasure: UnitOfMeasure
  unitPrice: number
  taxPercent: number
  discountPercent: number
  totalPrice: number
}

// --- Inventory ---
export interface StockItem extends BaseEntity {
  ingredient: Ingredient
  warehouse: Warehouse
  batchNumber: string
  quantityOnHand: number
  quantityReserved: number
  unitCost: number
  manufactureDate: string
  expiryDate: string
  receivedDate: string
  locationInWarehouse: string
  availableQuantity: number
}

export interface StockTransaction extends BaseEntity {
  transactionNumber: string
  transactionType: StockTransactionType
  ingredient: Ingredient
  fromWarehouse?: Warehouse
  toWarehouse?: Warehouse
  quantity: number
  unitOfMeasure: UnitOfMeasure
  unitCost: number
  batchNumber: string
  expiryDate: string
  transactionDate: string
  referenceNumber: string
  referenceType: string
  remarks: string
  performedBy: User
}

export interface StockAdjustmentRequest {
  ingredientId: string
  warehouseId: string
  transactionType: StockTransactionType
  quantity: number
  unitOfMeasureId: string
  batchNumber?: string
  expiryDate?: string
  unitCost?: number
  remarks: string
}

// --- Recipe ---
export interface Recipe extends BaseEntity {
  name: string
  code: string
  description: string
  kitchen: Kitchen
  yieldQuantity: number
  yieldUnit: string
  servingSize: number
  preparationTimeMinutes: number
  cookingTimeMinutes: number
  instructions: string
  totalCost: number
  costPerServing: number
  published: boolean
  ingredients: RecipeIngredient[]
}

export interface RecipeIngredient extends BaseEntity {
  ingredient: Ingredient
  quantity: number
  unitOfMeasure: UnitOfMeasure
  wastePercentage: number
  optional: boolean
  notes: string
}

// --- Notification ---
export interface Notification extends BaseEntity {
  notificationType: NotificationType
  title: string
  message: string
  referenceId: string
  referenceType: string
  read: boolean
  readAt: string
  emailSent: boolean
}

// --- Dashboard ---
export interface DashboardKPIs {
  totalIngredients: number
  totalStockValue: number
  lowStockItems: number
  expiringItems: number
  pendingPurchaseOrders: number
  todayConsumption: number
  wasteThisMonth: number
  activeSuppliers: number
}

export interface InventoryTrend {
  date: string
  stockIn: number
  stockOut: number
  waste: number
}

export interface TopConsumedIngredient {
  ingredientName: string
  totalQuantity: number
  unit: string
  totalCost: number
}

// --- Enums ---
export type RoleName =
  | 'SUPER_ADMIN'
  | 'KITCHEN_MANAGER'
  | 'STORE_MANAGER'
  | 'PURCHASE_MANAGER'
  | 'CHEF'
  | 'INVENTORY_STAFF'
  | 'AUDITOR'

export type StorageType =
  | 'DRY_STORAGE'
  | 'REFRIGERATED'
  | 'FROZEN'
  | 'COOL_ROOM'
  | 'AMBIENT'

export type PurchaseStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED'
  | 'REJECTED'

export type StockTransactionType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'WASTE'
  | 'DAMAGED'
  | 'EXPIRED'
  | 'CONSUMPTION'
  | 'RETURN'

export type NotificationType =
  | 'LOW_STOCK'
  | 'EXPIRY_ALERT'
  | 'REORDER_ALERT'
  | 'OVERSTOCK_ALERT'
  | 'PURCHASE_APPROVAL'
  | 'GOODS_RECEIVED'
  | 'SYSTEM'
