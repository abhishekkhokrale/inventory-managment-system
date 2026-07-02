import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, Chip, IconButton, Tooltip, TextField, InputAdornment
} from '@mui/material'
import { Add, Search, Edit, Delete, Visibility } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/api/axiosInstance'
import { useAuthStore } from '@/store/authStore'

export default function RecipesPage() {
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 })

  const { data, isLoading } = useQuery({
    queryKey: ['recipes', search, paginationModel],
    queryFn: () => axiosInstance.get('/recipes', {
      params: { search: search || undefined, page: paginationModel.page, size: paginationModel.pageSize }
    }).then(r => r.data),
  })

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 110, renderCell: (p) => (
      <Chip label={p.value} size="small" variant="outlined" />
    )},
    { field: 'name',                    headerName: 'Recipe Name', flex: 1, minWidth: 150 },
    { field: 'kitchen',                 headerName: 'Kitchen', width: 130, valueGetter: (_, r) => r.kitchen?.name },
    { field: 'yieldQuantity',           headerName: 'Yield', width: 100, type: 'number' },
    { field: 'preparationTimeMinutes',  headerName: 'Prep (min)', width: 100, type: 'number' },
    { field: 'cookingTimeMinutes',      headerName: 'Cook (min)', width: 100, type: 'number' },
    { field: 'costPerServing',          headerName: 'Cost/Serving', width: 120, type: 'number',
      valueFormatter: (v) => v ? `₹${Number(v).toFixed(2)}` : '-' },
    { field: 'published', headerName: 'Published', width: 100,
      renderCell: (p) => (
        <Chip label={p.value ? 'Published' : 'Draft'} size="small" color={p.value ? 'success' : 'default'} />
      )
    },
    { field: 'actions', headerName: 'Actions', width: 120, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/recipes/${p.row.id}/edit`)}><Visibility fontSize="small" /></IconButton></Tooltip>
          {hasPermission('RECIPE_UPDATE') && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => navigate(`/recipes/${p.row.id}/edit`)}>
                <Edit fontSize="small" />
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
        <Typography variant="h5" fontWeight={700}>Recipes</Typography>
        {hasPermission('RECIPE_CREATE') && (
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/recipes/new')}>
            New Recipe
          </Button>
        )}
      </Box>
      <Box mb={2}>
        <TextField
          placeholder="Search recipes..."
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
