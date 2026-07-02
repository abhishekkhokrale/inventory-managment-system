import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Typography, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Chip, IconButton, Tooltip
} from '@mui/material'
import {
  Add, Search, Edit, Delete, QrCode2, FileDownload
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ingredientsApi } from '@/api/ingredients.api'
import { StorageType } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { useSnackbar } from 'notistack'

const STORAGE_TYPE_COLORS: Record<StorageType, 'default' | 'success' | 'info' | 'warning' | 'error'> = {
  DRY_STORAGE:  'default',
  REFRIGERATED: 'info',
  FROZEN:       'warning',
  COOL_ROOM:    'success',
  AMBIENT:      'default',
}

export default function IngredientsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = useAuthStore()
  const { enqueueSnackbar } = useSnackbar()

  const [search, setSearch] = useState('')
  const [storageType, setStorageType] = useState<StorageType | ''>('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })

  const { data, isLoading } = useQuery({
    queryKey: ['ingredients', search, storageType, paginationModel],
    queryFn: () => ingredientsApi.getAll({
      search: search || undefined,
      storageType: storageType || undefined,
      page: paginationModel.page,
      size: paginationModel.pageSize,
    }),
  })

  const { mutate: deleteIngredient } = useMutation({
    mutationFn: ingredientsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      enqueueSnackbar('Ingredient deleted successfully', { variant: 'success' })
    },
    onError: () => enqueueSnackbar('Failed to delete ingredient', { variant: 'error' }),
  })

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 110, renderCell: (p) => (
      <Chip label={p.value} size="small" variant="outlined" />
    )},
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', width: 130, valueGetter: (_, row) => row.category?.name },
    { field: 'unitOfMeasure', headerName: 'UOM', width: 80, valueGetter: (_, row) => row.unitOfMeasure?.abbreviation },
    { field: 'storageType', headerName: 'Storage', width: 130, renderCell: (p: GridRenderCellParams) => (
      <Chip
        label={p.value?.replace('_', ' ')}
        size="small"
        color={STORAGE_TYPE_COLORS[p.value as StorageType]}
        variant="filled"
      />
    )},
    { field: 'reorderLevel', headerName: 'Reorder Level', width: 130, type: 'number' },
    { field: 'standardCost', headerName: 'Std Cost', width: 110, type: 'number',
      valueFormatter: (val) => val ? `$${Number(val).toFixed(2)}` : '-' },
    { field: 'perishable', headerName: 'Perishable', width: 100, type: 'boolean' },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Box>
          {hasPermission('INGREDIENT_UPDATE') && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => navigate(`/ingredients/${p.row.id}/edit`)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {hasPermission('INGREDIENT_DELETE') && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error"
                onClick={() => { if (confirm('Delete this ingredient?')) deleteIngredient(p.row.id) }}>
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
        <Typography variant="h5" fontWeight={700}>Ingredients</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<FileDownload />}>Export</Button>
          {hasPermission('INGREDIENT_CREATE') && (
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/ingredients/new')}>
              Add Ingredient
            </Button>
          )}
        </Box>
      </Box>

      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          placeholder="Search by name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Storage Type</InputLabel>
          <Select
            value={storageType}
            label="Storage Type"
            onChange={e => setStorageType(e.target.value as StorageType | '')}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="DRY_STORAGE">Dry Storage</MenuItem>
            <MenuItem value="REFRIGERATED">Refrigerated</MenuItem>
            <MenuItem value="FROZEN">Frozen</MenuItem>
            <MenuItem value="COOL_ROOM">Cool Room</MenuItem>
            <MenuItem value="AMBIENT">Ambient</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
