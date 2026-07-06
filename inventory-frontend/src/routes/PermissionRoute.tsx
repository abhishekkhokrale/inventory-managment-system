import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface PermissionRouteProps {
  permission?: string
  role?: string
}

export default function PermissionRoute({ permission, role }: PermissionRouteProps) {
  const { hasPermission, hasRole } = useAuthStore()

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />
  }
  if (role && !hasRole(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
