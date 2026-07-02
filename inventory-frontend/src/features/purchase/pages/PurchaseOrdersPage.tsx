import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Chip } from '@mui/material'
import { Add } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/api/axiosInstance'
import { PurchaseStatus } from '@/types'
import { useAuthStore } from '@/store/authStore'
import dayjs from 'dayjs'

const STATUS_COLORS: Record<PurchaseStatus, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  DRAFT:               'default',
  PENDING_APPROVAL:    'warning',
  APPROVED:            'info',
  ORDERED:             'info',
  PARTIALLY_RECEIVED:  'warning',
  RECEIVED:            'success',
  CANCELLED:           'error',
  REJECTED:            'error',
}

export default function PurchaseOrdersPage() {
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', paginationModel],
    queryFn: () => axiosInstance.get('/purchases', {
      params: { page: paginationModel.page, size: paginationModel.pageSize }
    }).then(r => r.data),
  })

  const columns: GridColDef[] = [
    { field: 'orderNumber',          headerName: 'PO Number', width: 150 },
    { field: 'supplier',             headerName: 'Supplier', flex: 1, valueGetter: (_, r) => r.supplier?.name },
    { field: 'orderDate',            headerName: 'Order Date', width: 120, valueFormatter: (v) => dayjs(v).format('MMM DD, YY') },
    { field: 'expectedDeliveryDate', headerName: 'Expected', width: 120, valueFormatter: (v) => v ? dayjs(v).format('MMM DD, YY') : '-' },
    { field: 'status', headerName: 'Status', width: 160,
      renderCell: (p) => (
        <Chip label={p.value?.replace('_', ' ')} size="small" color={STATUS_COLORS[p.value as PurchaseStatus] || 'default'} />
      )
    },
    { field: 'totalAmount', headerName: 'Total ($)', width: 120, type: 'number',
      valueFormatter: (v) => v ? `$${Number(v).toFixed(2)}` : '-' },
    { field: 'approvedBy', headerName: 'Approved By', width: 130, valueGetter: (_, r) => r.approvedBy?.fullName || '-' },
  ]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Purchase Orders</Typography>
        {hasPermission('PURCHASE_CREATE') && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/purchases/new')}>
            New Purchase Order
          </Button>
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
