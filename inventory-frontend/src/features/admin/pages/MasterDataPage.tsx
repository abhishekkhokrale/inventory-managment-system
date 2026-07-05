import { useState } from 'react'
import {
  Box, Typography, Tabs, Tab, Button, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { useAuthStore } from '@/store/authStore'
import {
  categoriesApi, unitsOfMeasureApi, warehousesApi, kitchensApi,
  CategoryPayload, UnitOfMeasurePayload, WarehousePayload, KitchenPayload,
} from '@/api/masterData.api'

const STORAGE_TYPES = ['DRY_STORAGE', 'REFRIGERATED', 'FROZEN', 'COOL_ROOM', 'AMBIENT']
const UOM_TYPES = ['WEIGHT', 'VOLUME', 'COUNT', 'LENGTH']

export default function MasterDataPage() {
  const [tab, setTab] = useState(0)
  const isSuperAdmin = useAuthStore(s => s.hasRole('SUPER_ADMIN'))

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={1}>Master Data</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage the dropdown lists used across Ingredients, Recipes, and Inventory forms.
      </Typography>

      {!isSuperAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have read-only access. Only Super Admin can add, edit, or delete master data.
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Categories" />
        <Tab label="Units of Measure" />
        <Tab label="Warehouses" />
        <Tab label="Kitchens" />
      </Tabs>

      {tab === 0 && <CategoriesTab canEdit={isSuperAdmin} />}
      {tab === 1 && <UnitsOfMeasureTab canEdit={isSuperAdmin} />}
      {tab === 2 && <WarehousesTab canEdit={isSuperAdmin} />}
      {tab === 3 && <KitchensTab canEdit={isSuperAdmin} />}
    </Box>
  )
}

// ============================================================
// Categories
// ============================================================
function CategoriesTab({ canEdit }: { canEdit: boolean }) {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<CategoryPayload>({ name: '', code: '', description: '' })

  const { data = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.getAll })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] })

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => { invalidate(); enqueueSnackbar('Category created', { variant: 'success' }); setDialogOpen(false) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryPayload }) => categoriesApi.update(id, data),
    onSuccess: () => { invalidate(); enqueueSnackbar('Category updated', { variant: 'success' }); setDialogOpen(false) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })
  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => { invalidate(); enqueueSnackbar('Category deleted', { variant: 'success' }) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '' }); setDialogOpen(true) }
  const openEdit = (row: any) => { setEditing(row); setForm({ name: row.name, code: row.code, description: row.description || '' }); setDialogOpen(true) }
  const handleSave = () => editing ? updateMutation.mutate({ id: editing.id, data: form }) : createMutation.mutate(form)

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
    ...(canEdit ? [{
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (p: any) => (
        <Box>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p.row)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteMutation.mutate(p.row.id)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    }] : []),
  ]

  return (
    <Box>
      {canEdit && (
        <Box mb={2}><Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Category</Button></Box>
      )}
      <DataGrid rows={data} columns={columns} loading={isLoading} autoHeight
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }} disableRowSelectionOnClick />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Code *" value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} fullWidth />
          <TextField label="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={!form.name || !form.code || createMutation.isPending || updateMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// ============================================================
// Units of Measure
// ============================================================
function UnitsOfMeasureTab({ canEdit }: { canEdit: boolean }) {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<UnitOfMeasurePayload>({ name: '', abbreviation: '', type: 'COUNT', baseConversionFactor: 1, baseUnit: '' })

  const { data = [], isLoading } = useQuery({ queryKey: ['units-of-measure'], queryFn: unitsOfMeasureApi.getAll })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['units-of-measure'] })

  const createMutation = useMutation({
    mutationFn: unitsOfMeasureApi.create,
    onSuccess: () => { invalidate(); enqueueSnackbar('Unit created', { variant: 'success' }); setDialogOpen(false) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnitOfMeasurePayload }) => unitsOfMeasureApi.update(id, data),
    onSuccess: () => { invalidate(); enqueueSnackbar('Unit updated', { variant: 'success' }); setDialogOpen(false) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })
  const deleteMutation = useMutation({
    mutationFn: unitsOfMeasureApi.delete,
    onSuccess: () => { invalidate(); enqueueSnackbar('Unit deleted', { variant: 'success' }) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })

  const openCreate = () => { setEditing(null); setForm({ name: '', abbreviation: '', type: 'COUNT', baseConversionFactor: 1, baseUnit: '' }); setDialogOpen(true) }
  const openEdit = (row: any) => {
    setEditing(row)
    setForm({ name: row.name, abbreviation: row.abbreviation, type: row.type, baseConversionFactor: row.baseConversionFactor, baseUnit: row.baseUnit })
    setDialogOpen(true)
  }
  const handleSave = () => editing ? updateMutation.mutate({ id: editing.id, data: form }) : createMutation.mutate(form)

  const columns: GridColDef[] = [
    { field: 'abbreviation', headerName: 'Abbr.', width: 100 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'type', headerName: 'Type', width: 130 },
    { field: 'baseConversionFactor', headerName: 'Conversion Factor', width: 160, type: 'number' },
    { field: 'baseUnit', headerName: 'Base Unit', width: 110 },
    ...(canEdit ? [{
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (p: any) => (
        <Box>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p.row)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteMutation.mutate(p.row.id)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    }] : []),
  ]

  return (
    <Box>
      {canEdit && (
        <Box mb={2}><Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Unit</Button></Box>
      )}
      <DataGrid rows={data} columns={columns} loading={isLoading} autoHeight
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }} disableRowSelectionOnClick />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Unit of Measure' : 'Add Unit of Measure'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Abbreviation *" value={form.abbreviation}
            onChange={e => setForm({ ...form, abbreviation: e.target.value })} fullWidth />
          <TextField select label="Type *" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} fullWidth>
            {UOM_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Base Conversion Factor *" type="number" value={form.baseConversionFactor}
            onChange={e => setForm({ ...form, baseConversionFactor: Number(e.target.value) })} fullWidth
            inputProps={{ step: '0.00000001', min: 0 }} />
          <TextField label="Base Unit *" value={form.baseUnit}
            onChange={e => setForm({ ...form, baseUnit: e.target.value })} fullWidth
            helperText="e.g. all weight units convert to 'kg', volume units to 'L'" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={!form.name || !form.abbreviation || !form.baseUnit || createMutation.isPending || updateMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// ============================================================
// Warehouses
// ============================================================
function WarehousesTab({ canEdit }: { canEdit: boolean }) {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<WarehousePayload>({ name: '', code: '', storageType: 'DRY_STORAGE', kitchenId: '' })

  const { data = [], isLoading } = useQuery({ queryKey: ['warehouses'], queryFn: warehousesApi.getAll })
  const { data: kitchens = [] } = useQuery({ queryKey: ['kitchens'], queryFn: kitchensApi.getAll })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['warehouses'] })

  const createMutation = useMutation({
    mutationFn: warehousesApi.create,
    onSuccess: () => { invalidate(); enqueueSnackbar('Warehouse created', { variant: 'success' }); setDialogOpen(false) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WarehousePayload }) => warehousesApi.update(id, data),
    onSuccess: () => { invalidate(); enqueueSnackbar('Warehouse updated', { variant: 'success' }); setDialogOpen(false) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })
  const deleteMutation = useMutation({
    mutationFn: warehousesApi.delete,
    onSuccess: () => { invalidate(); enqueueSnackbar('Warehouse deleted', { variant: 'success' }) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', storageType: 'DRY_STORAGE', kitchenId: kitchens[0]?.id || '' }); setDialogOpen(true) }
  const openEdit = (row: any) => {
    setEditing(row)
    setForm({
      name: row.name, code: row.code, storageType: row.storageType, location: row.location,
      capacity: row.capacity, capacityUnit: row.capacityUnit,
      temperatureMin: row.temperatureMin, temperatureMax: row.temperatureMax,
      kitchenId: row.kitchen?.id,
    })
    setDialogOpen(true)
  }
  const handleSave = () => editing ? updateMutation.mutate({ id: editing.id, data: form }) : createMutation.mutate(form)

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'storageType', headerName: 'Storage Type', width: 140 },
    { field: 'kitchen', headerName: 'Kitchen', width: 140, valueGetter: (_, r) => r.kitchen?.name },
    { field: 'location', headerName: 'Location', flex: 1, minWidth: 150 },
    ...(canEdit ? [{
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (p: any) => (
        <Box>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p.row)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteMutation.mutate(p.row.id)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    }] : []),
  ]

  return (
    <Box>
      {canEdit && (
        <Box mb={2}><Button variant="contained" startIcon={<Add />} onClick={openCreate} disabled={!kitchens.length}>Add Warehouse</Button></Box>
      )}
      <DataGrid rows={data} columns={columns} loading={isLoading} autoHeight
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }} disableRowSelectionOnClick />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Code *" value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} fullWidth />
          <TextField select label="Storage Type *" value={form.storageType}
            onChange={e => setForm({ ...form, storageType: e.target.value })} fullWidth>
            {STORAGE_TYPES.map(t => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <TextField select label="Kitchen *" value={form.kitchenId}
            onChange={e => setForm({ ...form, kitchenId: e.target.value })} fullWidth>
            {kitchens.map((k: any) => <MenuItem key={k.id} value={k.id}>{k.name}</MenuItem>)}
          </TextField>
          <TextField label="Location" value={form.location || ''}
            onChange={e => setForm({ ...form, location: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={!form.name || !form.code || !form.kitchenId || createMutation.isPending || updateMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

// ============================================================
// Kitchens
// ============================================================
function KitchensTab({ canEdit }: { canEdit: boolean }) {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<KitchenPayload>({ name: '', code: '' })

  const { data = [], isLoading } = useQuery({ queryKey: ['kitchens'], queryFn: kitchensApi.getAll })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['kitchens'] })

  const createMutation = useMutation({
    mutationFn: kitchensApi.create,
    onSuccess: () => { invalidate(); enqueueSnackbar('Kitchen created', { variant: 'success' }); setDialogOpen(false) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: KitchenPayload }) => kitchensApi.update(id, data),
    onSuccess: () => { invalidate(); enqueueSnackbar('Kitchen updated', { variant: 'success' }); setDialogOpen(false) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })
  const deleteMutation = useMutation({
    mutationFn: kitchensApi.delete,
    onSuccess: () => { invalidate(); enqueueSnackbar('Kitchen deleted', { variant: 'success' }) },
    onError: (e: any) => enqueueSnackbar(e.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '' }); setDialogOpen(true) }
  const openEdit = (row: any) => {
    setEditing(row)
    setForm({ name: row.name, code: row.code, location: row.location, contactEmail: row.contactEmail, contactPhone: row.contactPhone, description: row.description })
    setDialogOpen(true)
  }
  const handleSave = () => editing ? updateMutation.mutate({ id: editing.id, data: form }) : createMutation.mutate(form)

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'location', headerName: 'Location', flex: 1, minWidth: 150 },
    { field: 'contactEmail', headerName: 'Contact Email', width: 180 },
    ...(canEdit ? [{
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (p: any) => (
        <Box>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p.row)}><Edit fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => deleteMutation.mutate(p.row.id)}><Delete fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    }] : []),
  ]

  return (
    <Box>
      {canEdit && (
        <Box mb={2}><Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Kitchen</Button></Box>
      )}
      <DataGrid rows={data} columns={columns} loading={isLoading} autoHeight
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }} disableRowSelectionOnClick />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Kitchen' : 'Add Kitchen'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Code *" value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} fullWidth />
          <TextField label="Location" value={form.location || ''}
            onChange={e => setForm({ ...form, location: e.target.value })} fullWidth />
          <TextField label="Contact Email" value={form.contactEmail || ''}
            onChange={e => setForm({ ...form, contactEmail: e.target.value })} fullWidth />
          <TextField label="Contact Phone" value={form.contactPhone || ''}
            onChange={e => setForm({ ...form, contactPhone: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            disabled={!form.name || !form.code || createMutation.isPending || updateMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
