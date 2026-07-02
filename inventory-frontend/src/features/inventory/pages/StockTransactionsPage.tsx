import { useState } from 'react'
import { Box, Typography, Chip, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Button } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '@/api/inventory.api'
import { FileDownload } from '@mui/icons-material'
import dayjs from 'dayjs'

const TXN_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  STOCK_IN:    'success',
  STOCK_OUT:   'info',
  WASTE:       'error',
  DAMAGED:     'warning',
  EXPIRED:     'error',
  ADJUSTMENT:  'default',
  TRANSFER:    'info',
  CONSUMPTION: 'info',
  RETURN:      'success',
}

export default function StockTransactionsPage() {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })
  const [transactionType, setTransactionType] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', transactionType, fromDate, toDate, paginationModel],
    queryFn: () => inventoryApi.getTransactions({
      type: transactionType || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      page: paginationModel.page,
      size: paginationModel.pageSize,
    }),
  })

  const columns: GridColDef[] = [
    { field: 'transactionNumber', headerName: 'Txn Number', width: 150 },
    { field: 'transactionDate',   headerName: 'Date & Time', width: 160,
      valueFormatter: (val) => dayjs(val).format('MMM DD, YY HH:mm') },
    { field: 'transactionType',   headerName: 'Type', width: 140,
      renderCell: (p) => (
        <Chip label={p.value?.replace('_', ' ')} size="small" color={TXN_COLORS[p.value] || 'default'} />
      )
    },
    { field: 'ingredient',  headerName: 'Ingredient', flex: 1, minWidth: 140, valueGetter: (_, r) => r.ingredient?.name },
    { field: 'quantity',    headerName: 'Quantity', width: 110, type: 'number', valueFormatter: (val) => Number(val).toFixed(3) },
    { field: 'unitOfMeasure', headerName: 'UOM', width: 70, valueGetter: (_, r) => r.unitOfMeasure?.abbreviation },
    { field: 'batchNumber', headerName: 'Batch', width: 110 },
    { field: 'performedBy', headerName: 'Performed By', width: 130, valueGetter: (_, r) => r.performedBy?.fullName },
    { field: 'remarks',     headerName: 'Remarks', flex: 1, minWidth: 100 },
  ]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Stock Transactions</Typography>
        <Button variant="outlined" startIcon={<FileDownload />}>Export</Button>
      </Box>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Transaction Type</InputLabel>
            <Select value={transactionType} label="Transaction Type" onChange={e => setTransactionType(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="STOCK_IN">Stock In</MenuItem>
              <MenuItem value="STOCK_OUT">Stock Out</MenuItem>
              <MenuItem value="WASTE">Waste</MenuItem>
              <MenuItem value="DAMAGED">Damaged</MenuItem>
              <MenuItem value="EXPIRED">Expired</MenuItem>
              <MenuItem value="ADJUSTMENT">Adjustment</MenuItem>
              <MenuItem value="TRANSFER">Transfer</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField size="small" label="From Date" type="date" fullWidth
            value={fromDate} onChange={e => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField size="small" label="To Date" type="date" fullWidth
            value={toDate} onChange={e => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
      </Grid>

      <DataGrid
        rows={data?.content ?? []}
        columns={columns}
        loading={isLoading}
        rowCount={data?.totalElements ?? 0}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50, 100]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
      />
    </Box>
  )
}
