import { useMemo } from 'react'
import {
  Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  Checkbox, Paper, TableContainer, Chip, Alert, CircularProgress
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { rolesApi, permissionsApi } from '@/api/rolePermissions.api'

interface Permission {
  id: string
  name: string
  description: string
  module: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export default function RolePermissionsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: rolesApi.getAll,
  })
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: permissionsApi.getAll,
  })

  const modules = useMemo(() => {
    const groups = new Map<string, Permission[]>()
    for (const p of permissions) {
      const key = p.module || 'OTHER'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(p)
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [permissions])

  const { mutate: togglePermission, isPending } = useMutation({
    mutationFn: ({ role, permissionId, checked }: { role: Role; permissionId: string; checked: boolean }) => {
      const currentIds = role.permissions.map(p => p.id)
      const nextIds = checked
        ? [...currentIds, permissionId]
        : currentIds.filter(id => id !== permissionId)
      return rolesApi.updatePermissions(role.id, nextIds)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      enqueueSnackbar('Role permissions updated', { variant: 'success' })
    },
    onError: (e: any) =>
      enqueueSnackbar(e.response?.data?.message || 'Failed to update permissions', { variant: 'error' }),
  })

  const hasPermission = (role: Role, permissionId: string) =>
    role.permissions.some(p => p.id === permissionId)

  if (rolesLoading || permissionsLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={1}>Role → Page Access Matrix</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Toggle which permissions each role has. Page and API access across the app are driven directly by these grants.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        SUPER_ADMIN always has every permission and can't be edited here — it's the only role gated by identity rather than
        individual permissions, so changing it here wouldn't be safe.
      </Alert>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Permission</TableCell>
              {roles.map(role => (
                <TableCell key={role.id} align="center" sx={{ fontWeight: 700, minWidth: 130 }}>
                  {role.name.replace(/_/g, ' ')}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {modules.map(([module, modulePermissions]) => (
              <>
                <TableRow key={`module-${module}`}>
                  <TableCell colSpan={roles.length + 1} sx={{ bgcolor: 'action.hover' }}>
                    <Chip label={module} size="small" color="primary" variant="outlined" />
                  </TableCell>
                </TableRow>
                {modulePermissions.map(permission => (
                  <TableRow key={permission.id} hover>
                    <TableCell>
                      <Typography variant="body2">{permission.name}</Typography>
                      {permission.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {permission.description}
                        </Typography>
                      )}
                    </TableCell>
                    {roles.map(role => {
                      const isSuperAdmin = role.name === 'SUPER_ADMIN'
                      return (
                        <TableCell key={role.id} align="center">
                          <Checkbox
                            size="small"
                            checked={isSuperAdmin || hasPermission(role, permission.id)}
                            disabled={isSuperAdmin || isPending}
                            onChange={(e) => togglePermission({ role, permissionId: permission.id, checked: e.target.checked })}
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
