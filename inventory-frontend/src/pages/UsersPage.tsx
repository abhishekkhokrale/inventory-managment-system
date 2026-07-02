import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Chip, Avatar, IconButton, Tooltip, Button
} from '@mui/material'
import { Add, Edit, Block, CheckCircle } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/api/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import dayjs from 'dayjs'

export default function UsersPage() {
  const navigate = useNavigate()
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })
  const { hasPermission } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['users', paginationModel],
    queryFn: () => axiosInstance.get('/users', { params: { page: paginationModel.page, size: paginationModel.pageSize } })
      .then(r => r.data),
  })

  const columns: GridColDef[] = [
    { field: 'avatar', headerName: '', width: 60, sortable: false,
      renderCell: (p) => (
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
          {p.row.firstName?.charAt(0)}
        </Avatar>
      )
    },
    { field: 'fullName',  headerName: 'Name', flex: 1, minWidth: 130 },
    { field: 'username',  headerName: 'Username', width: 130 },
    { field: 'email',     headerName: 'Email', flex: 1, minWidth: 160 },
    { field: 'roles',     headerName: 'Roles', width: 200,
      renderCell: (p) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {p.row.roles?.slice(0, 2).map((r: any) => (
            <Chip key={r.id} label={r.name.replace('_', ' ')} size="small" color="primary" variant="outlined" />
          ))}
        </Box>
      )
    },
    { field: 'active', headerName: 'Status', width: 100,
      renderCell: (p) => (
        <Chip
          label={p.value ? 'Active' : 'Inactive'}
          size="small"
          color={p.value ? 'success' : 'default'}
          icon={p.value ? <CheckCircle /> : <Block />}
        />
      )
    },
    { field: 'lastLogin', headerName: 'Last Login', width: 160,
      valueFormatter: (val) => val ? dayjs(val).format('MMM DD, YY HH:mm') : 'Never' },
    { field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (p) => (
        <Box>
          {hasPermission('USER_UPDATE') && (
            <Tooltip title="Edit User">
              <IconButton size="small" onClick={() => navigate(`/users/${p.row.id}/edit`)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    },
  ]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>User Management</Typography>
        {hasPermission('USER_CREATE') && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/users/new')}>Add User</Button>
        )}
      </Box>
      <DataGrid
        rows={data?.content ?? []}
        columns={columns}
        loading={isLoading}
        rowCount={data?.totalElements ?? 0}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
      />
    </Box>
  )
}
