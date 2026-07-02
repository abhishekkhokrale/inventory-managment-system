import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Typography, TextField, InputAdornment, IconButton, Tooltip, Chip, Rating
} from '@mui/material'
import { Add, Search, Edit, Delete, Phone, Email } from '@mui/icons-material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/api/axiosInstance'
import { useAuthStore } from '@/store/authStore'
import { useSnackbar } from 'notistack'

export default function SuppliersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = useAuthStore()
  const { enqueueSnackbar } = useSnackbar()
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', search, paginationModel],
    queryFn: () => axiosInstance.get('/suppliers', {
      params: { search: search || undefined, page: paginationModel.page, size: paginationModel.pageSize }
    }).then(r => r.data),
  })

  const { mutate: deleteSupplier } = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      enqueueSnackbar('Supplier deleted', { variant: 'success' })
    },
  })

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 100, renderCell: (p) => (
      <Chip label={p.value} size="small" variant="outlined" />
    )},
    { field: 'name',          headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'contactPerson', headerName: 'Contact', width: 130 },
    { field: 'email', headerName: 'Email', width: 180, renderCell: (p) => (
      <Box display="flex" alignItems="center" gap={0.5}>
        <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2">{p.value}</Typography>
      </Box>
    )},
    { field: 'phone', headerName: 'Phone', width: 130, renderCell: (p) => (
      <Box display="flex" alignItems="center" gap={0.5}>
        <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="body2">{p.value}</Typography>
      </Box>
    )},
    { field: 'city',          headerName: 'City', width: 110 },
    { field: 'leadTimeDays',  headerName: 'Lead Days', width: 100, type: 'number' },
    { field: 'rating', headerName: 'Rating', width: 140, renderCell: (p: GridRenderCellParams) => (
      p.value ? <Rating value={Number(p.value)} precision={0.5} readOnly size="small" /> : '-'
    )},
    { field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Box>
          {hasPermission('SUPPLIER_UPDATE') && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => navigate(`/suppliers/${p.row.id}/edit`)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {hasPermission('SUPPLIER_DELETE') && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error"
                onClick={() => { if (confirm('Delete this supplier?')) deleteSupplier(p.row.id) }}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Suppliers</Typography>
        {hasPermission('SUPPLIER_CREATE') && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/suppliers/new')}>
            Add Supplier
          </Button>
        )}
      </Box>
      <Box mb={2}>
        <TextField
          placeholder="Search suppliers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />
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
