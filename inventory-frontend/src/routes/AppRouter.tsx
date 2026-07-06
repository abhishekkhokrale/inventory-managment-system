import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { CircularProgress, Box } from '@mui/material'
import MainLayout from '@/layouts/MainLayout'
import AuthLayout from '@/layouts/AuthLayout'
import ProtectedRoute from './ProtectedRoute'
import PermissionRoute from './PermissionRoute'

const LoginPage          = lazy(() => import('@/features/auth/pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const DashboardPage      = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const IngredientsPage    = lazy(() => import('@/features/inventory/pages/IngredientsPage'))
const IngredientFormPage = lazy(() => import('@/features/inventory/pages/IngredientFormPage'))
const StockLevelsPage    = lazy(() => import('@/features/inventory/pages/StockLevelsPage'))
const StockTransactionsPage = lazy(() => import('@/features/inventory/pages/StockTransactionsPage'))
const SuppliersPage      = lazy(() => import('@/features/supplier/pages/SuppliersPage'))
const SupplierFormPage   = lazy(() => import('@/features/supplier/pages/SupplierFormPage'))
const PurchaseOrdersPage = lazy(() => import('@/features/purchase/pages/PurchaseOrdersPage'))
const PurchaseOrderFormPage = lazy(() => import('@/features/purchase/pages/PurchaseOrderFormPage'))
const RecipesPage        = lazy(() => import('@/features/recipe/pages/RecipesPage'))
const RecipeFormPage     = lazy(() => import('@/features/recipe/pages/RecipeFormPage'))
const ReportsPage        = lazy(() => import('@/features/reports/pages/ReportsPage'))
const UsersPage          = lazy(() => import('@/pages/UsersPage'))
const UserFormPage       = lazy(() => import('@/pages/UserFormPage'))
const MasterDataPage     = lazy(() => import('@/features/admin/pages/MasterDataPage'))
const ProfilePage        = lazy(() => import('@/pages/ProfilePage'))
const NotFoundPage       = lazy(() => import('@/pages/NotFoundPage'))
const UnauthorizedPage   = lazy(() => import('@/pages/UnauthorizedPage'))

const Loader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
    <CircularProgress color="primary" />
  </Box>
)

export default function AppRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route element={<PermissionRoute permission="DASHBOARD_VIEW" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Inventory */}
            <Route element={<PermissionRoute permission="INGREDIENT_READ" />}>
              <Route path="/ingredients" element={<IngredientsPage />} />
              <Route path="/ingredients/new" element={<IngredientFormPage />} />
              <Route path="/ingredients/:id/edit" element={<IngredientFormPage />} />
            </Route>
            <Route element={<PermissionRoute permission="INVENTORY_READ" />}>
              <Route path="/stock" element={<StockLevelsPage />} />
              <Route path="/stock/transactions" element={<StockTransactionsPage />} />
            </Route>

            {/* Suppliers */}
            <Route element={<PermissionRoute permission="SUPPLIER_READ" />}>
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/suppliers/new" element={<SupplierFormPage />} />
              <Route path="/suppliers/:id/edit" element={<SupplierFormPage />} />
            </Route>

            {/* Purchases */}
            <Route element={<PermissionRoute permission="PURCHASE_READ" />}>
              <Route path="/purchases" element={<PurchaseOrdersPage />} />
              <Route path="/purchases/new" element={<PurchaseOrderFormPage />} />
              <Route path="/purchases/:id" element={<PurchaseOrderFormPage />} />
            </Route>

            {/* Recipes */}
            <Route element={<PermissionRoute permission="RECIPE_READ" />}>
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/recipes/new" element={<RecipeFormPage />} />
              <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
            </Route>

            {/* Reports */}
            <Route element={<PermissionRoute permission="REPORT_VIEW" />}>
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Admin */}
            <Route element={<PermissionRoute permission="USER_READ" />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/new" element={<UserFormPage />} />
              <Route path="/users/:id/edit" element={<UserFormPage />} />
            </Route>
            <Route element={<PermissionRoute role="SUPER_ADMIN" />}>
              <Route path="/master-data" element={<MasterDataPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
