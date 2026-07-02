import { useState } from 'react'
import {
  Box, Button, Typography, Chip, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Grid, Alert
} from '@mui/material'
import { Add, FileDownload, Warning } from '@mui/icons-material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { inventoryApi } from '@/api/inventory.api'
import { StockAdjustmentRequest, StockTransactionType } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { useSnackbar } from 'notistack'
import dayjs from 'dayjs'
import axiosInstance from '@/api/axiosInstance'

export default function StockLevelsPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuthStore()
  const { enqueueSnackbar } = useSnackbar()
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'IN' | 'OUT' | 'ADJUST'>('IN')

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'stock', paginationModel],
    queryFn: () => inventoryApi.getStock({ page: paginationModel.page, size: paginationModel.pageSize }),
  })

  const { data: expiringData } = useQuery({
    queryKey: ['inventory', 'expiring'],
    queryFn: () => inventoryApi.getExpiringStock(7),
  })

  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients', 'all'],
    queryFn: () => axiosInstance.get('/ingredients?size=200').then(r => r.data?.content ?? []),
  })
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => axiosInstance.get('/warehouses').then(r => r.data),
  })
  const { data: uoms = [] } = useQuery({
    queryKey: ['uoms'],
    queryFn: () => axiosInstance.get('/units-of-measure').then(r => r.data),
  })

  const { control, handleSubmit, reset } = useForm<StockAdjustmentRequest>()

  const { mutate: processTransaction, isPending } = useMutation({
    mutationFn: (data: StockAdjustmentRequest) => {
      if (dialogType === 'IN') return inventoryApi.stockIn(data)
      if (dialogType === 'OUT') return inventoryApi.stockOut(data)
      return inventoryApi.adjustment(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      enqueueSnackbar('Stock transaction recorded successfully', { variant: 'success' })
      setDialogOpen(false)
      reset()
    },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Transaction failed', { variant: 'error' }),
  })

  const columns: GridColDef[] = [
    { field: 'ingredient', headerName: 'Ingredient', flex: 1, minWidth: 150, valueGetter: (_, row) => row.ingredient?.name },
    { field: 'warehouse', headerName: 'Warehouse', width: 130, valueGetter: (_, row) => row.warehouse?.name },
    { field: 'batchNumber', headerName: 'Batch', width: 110 },
    { field: 'quantityOnHand', headerName: 'On Hand', width: 110, type: 'number',
      renderCell: (p: GridRenderCellParams) => {
        const ingredient = p.row.ingredient
        const isLow = ingredient?.reorderLevel && p.value <= ingredient.reorderLevel
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            {isLow && <Warning sx={{ fontSize: 16, color: 'warning.main' }} />}
            <span style={{ color: isLow ? '#E65100' : 'inherit', fontWeight: isLow ? 600 : 400 }}>
              {Number(p.value).toFixed(2)} {p.row.ingredient?.unitOfMeasure?.abbreviation}
            </span>
          </Box>
        )
      }
    },
    { field: 'quantityReserved', headerName: 'Reserved', width: 100, type: 'number',
      valueFormatter: (val) => Number(val).toFixed(2) },
    { field: 'unitCost', headerName: 'Unit Cost', width: 100, type: 'number',
      valueFormatter: (val) => val ? `$${Number(val).toFixed(2)}` : '-' },
    { field: 'expiryDate', headerName: 'Expiry Date', width: 120,
      renderCell: (p: GridRenderCellParams) => {
        if (!p.value) return '-'
        const days = dayjs(p.value).diff(dayjs(), 'day')
        const color = days <= 3 ? 'error' : days <= 7 ? 'warning' : 'default'
        return <Chip label={dayjs(p.value).format('MMM DD, YY')} size="small" color={color} variant="outlined" />
      }
    },
    { field: 'receivedDate', headerName: 'Received', width: 110,
      valueFormatter: (val) => val ? dayjs(val).format('MMM DD, YY') : '-' },
  ]

  const openDialog = (type: 'IN' | 'OUT' | 'ADJUST') => {
    setDialogType(type)
    reset({
      transactionType: type === 'IN' ? 'STOCK_IN' : type === 'OUT' ? 'STOCK_OUT' : 'ADJUSTMENT',
    } as any)
    setDialogOpen(true)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Stock Levels</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<FileDownload />}>Export</Button>
          {hasPermission('INVENTORY_CREATE') && (
            <Button variant="contained" color="success" startIcon={<Add />} onClick={() => openDialog('IN')}>
              Stock In
            </Button>
          )}
          {hasPermission('INVENTORY_UPDATE') && (
            <Button variant="contained" color="warning" onClick={() => openDialog('OUT')}>
              Stock Out
            </Button>
          )}
          {hasPermission('INVENTORY_ADJUST') && (
            <Button variant="outlined" color="error" onClick={() => openDialog('ADJUST')}>
              Adjustment
            </Button>
          )}
        </Box>
      </Box>

      {expiringData && expiringData.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>{expiringData.length} stock items</strong> are expiring within 7 days. Please review.
        </Alert>
      )}

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

      {/* Stock Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'IN' ? 'Stock In' : dialogType === 'OUT' ? 'Stock Out' : 'Stock Adjustment'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit(d => processTransaction(d))}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller name="ingredientId" control={control} render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Ingredient *</InputLabel>
                    <Select {...field} label="Ingredient *">
                      {(Array.isArray(ingredients) ? ingredients : []).map((i: any) => (
                        <MenuItem key={i.id} value={i.id}>{i.name} ({i.code})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name="warehouseId" control={control} render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Warehouse *</InputLabel>
                    <Select {...field} label="Warehouse *">
                      {(Array.isArray(warehouses) ? warehouses : []).map((w: any) => (
                        <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              {dialogType === 'ADJUST' && (
                <Grid item xs={12}>
                  <Controller name="transactionType" control={control} render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Adjustment Type *</InputLabel>
                      <Select {...field} label="Adjustment Type *">
                        <MenuItem value="WASTE">Waste</MenuItem>
                        <MenuItem value="DAMAGED">Damaged</MenuItem>
                        <MenuItem value="EXPIRED">Expired</MenuItem>
                        <MenuItem value="ADJUSTMENT">General Adjustment</MenuItem>
                      </Select>
                    </FormControl>
                  )} />
                </Grid>
              )}
              <Grid item xs={6}>
                <Controller name="quantity" control={control} render={({ field }) => (
                  <TextField {...field} label="Quantity *" type="number" fullWidth
                    inputProps={{ step: '0.001', min: '0.001' }} />
                )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name="unitOfMeasureId" control={control} render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>UOM *</InputLabel>
                    <Select {...field} label="UOM *">
                      {(Array.isArray(uoms) ? uoms : []).map((u: any) => (
                        <MenuItem key={u.id} value={u.id}>{u.abbreviation}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name="batchNumber" control={control} render={({ field }) => (
                  <TextField {...field} label="Batch Number" fullWidth />
                )} />
              </Grid>
              <Grid item xs={6}>
                <Controller name="expiryDate" control={control} render={({ field }) => (
                  <TextField {...field} label="Expiry Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name="unitCost" control={control} render={({ field }) => (
                  <TextField {...field} label="Unit Cost" type="number" fullWidth
                    InputProps={{ startAdornment: '$' }} inputProps={{ step: '0.0001', min: '0' }} />
                )} />
              </Grid>
              <Grid item xs={12}>
                <Controller name="remarks" control={control} render={({ field }) => (
                  <TextField {...field} label="Remarks *" fullWidth multiline rows={2} />
                )} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
