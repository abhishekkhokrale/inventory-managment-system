import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, TextField, Typography, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel,
  Checkbox, InputAdornment, CircularProgress, Breadcrumbs, Link
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ingredientsApi } from '@/api/ingredients.api'
import axiosInstance from '@/api/axiosInstance'
import { useSnackbar } from 'notistack'

const schema = z.object({
  name:              z.string().min(1, 'Name is required'),
  code:              z.string().min(1, 'Code is required').regex(/^[A-Z0-9-]+$/, 'Code must be uppercase alphanumeric'),
  description:       z.string().optional(),
  categoryId:        z.string().min(1, 'Category is required'),
  unitOfMeasureId:   z.string().min(1, 'UOM is required'),
  shelfLifeDays:     z.coerce.number().positive().optional(),
  reorderLevel:      z.coerce.number().min(0).optional(),
  minimumStock:      z.coerce.number().min(0).optional(),
  maximumStock:      z.coerce.number().min(0).optional(),
  storageType:       z.string().min(1, 'Storage type is required'),
  standardCost:      z.coerce.number().min(0).optional(),
  barcode:           z.string().optional(),
  allergens:         z.string().optional(),
  perishable:        z.boolean().default(true),
  trackBatch:        z.boolean().default(true),
  trackExpiry:       z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

export default function IngredientFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => axiosInstance.get('/categories').then(r => r.data),
  })
  const { data: uoms = [] } = useQuery({
    queryKey: ['uoms'],
    queryFn: () => axiosInstance.get('/units-of-measure').then(r => r.data),
  })
  const { data: existing } = useQuery({
    queryKey: ['ingredients', id],
    queryFn: () => ingredientsApi.getById(id!),
    enabled: isEdit,
  })

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { perishable: true, trackBatch: true, trackExpiry: true },
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        code: existing.code,
        description: existing.description,
        categoryId: existing.category?.id,
        unitOfMeasureId: existing.unitOfMeasure?.id,
        shelfLifeDays: existing.shelfLifeDays,
        reorderLevel: existing.reorderLevel,
        minimumStock: existing.minimumStock,
        maximumStock: existing.maximumStock,
        storageType: existing.storageType,
        standardCost: existing.standardCost,
        barcode: existing.barcode,
        allergens: existing.allergens,
        perishable: existing.perishable,
        trackBatch: existing.trackBatch,
        trackExpiry: existing.trackExpiry,
      })
    }
  }, [existing, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? ingredientsApi.update(id!, data as any) : ingredientsApi.create(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      enqueueSnackbar(`Ingredient ${isEdit ? 'updated' : 'created'} successfully`, { variant: 'success' })
      navigate('/ingredients')
    },
    onError: () => enqueueSnackbar('Operation failed. Please try again.', { variant: 'error' }),
  })

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate('/ingredients')} underline="hover" color="inherit">
          Ingredients
        </Link>
        <Typography color="text.primary">{isEdit ? 'Edit' : 'New'} Ingredient</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Edit Ingredient' : 'Add New Ingredient'}
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/ingredients')}>Back</Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit(data => mutate(data))}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller name="name" control={control} render={({ field }) => (
                      <TextField {...field} label="Ingredient Name *" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="code" control={control} render={({ field }) => (
                      <TextField {...field} label="Code *" fullWidth
                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                        error={!!errors.code} helperText={errors.code?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller name="description" control={control} render={({ field }) => (
                      <TextField {...field} label="Description" fullWidth multiline rows={3} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="categoryId" control={control} render={({ field }) => (
                      <FormControl fullWidth error={!!errors.categoryId}>
                        <InputLabel>Category *</InputLabel>
                        <Select {...field} label="Category *">
                          {(Array.isArray(categories?.content) ? categories.content : categories).map((cat: any) => (
                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="unitOfMeasureId" control={control} render={({ field }) => (
                      <FormControl fullWidth error={!!errors.unitOfMeasureId}>
                        <InputLabel>Unit of Measure *</InputLabel>
                        <Select {...field} label="Unit of Measure *">
                          {(Array.isArray(uoms?.content) ? uoms.content : uoms).map((uom: any) => (
                            <MenuItem key={uom.id} value={uom.id}>{uom.name} ({uom.abbreviation})</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="storageType" control={control} render={({ field }) => (
                      <FormControl fullWidth error={!!errors.storageType}>
                        <InputLabel>Storage Type *</InputLabel>
                        <Select {...field} label="Storage Type *">
                          <MenuItem value="DRY_STORAGE">Dry Storage</MenuItem>
                          <MenuItem value="REFRIGERATED">Refrigerated</MenuItem>
                          <MenuItem value="FROZEN">Frozen</MenuItem>
                          <MenuItem value="COOL_ROOM">Cool Room</MenuItem>
                          <MenuItem value="AMBIENT">Ambient</MenuItem>
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="shelfLifeDays" control={control} render={({ field }) => (
                      <TextField {...field} label="Shelf Life (days)" fullWidth type="number"
                        InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }} />
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Stock Levels & Pricing</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Controller name="reorderLevel" control={control} render={({ field }) => (
                      <TextField {...field} label="Reorder Level" fullWidth type="number" />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller name="minimumStock" control={control} render={({ field }) => (
                      <TextField {...field} label="Minimum Stock" fullWidth type="number" />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller name="maximumStock" control={control} render={({ field }) => (
                      <TextField {...field} label="Maximum Stock" fullWidth type="number" />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="standardCost" control={control} render={({ field }) => (
                      <TextField {...field} label="Standard Cost" fullWidth type="number"
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="barcode" control={control} render={({ field }) => (
                      <TextField {...field} label="Barcode" fullWidth />
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller name="allergens" control={control} render={({ field }) => (
                      <TextField {...field} label="Allergens" fullWidth placeholder="e.g., Gluten, Dairy, Nuts" />
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Tracking Options</Typography>
                <Controller name="perishable" control={control} render={({ field }) => (
                  <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Is Perishable" />
                )} />
                <Controller name="trackBatch" control={control} render={({ field }) => (
                  <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Track Batch Number" />
                )} />
                <Controller name="trackExpiry" control={control} render={({ field }) => (
                  <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Track Expiry Date" />
                )} />
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isPending}
                  startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <Save />}
                >
                  {isEdit ? 'Update Ingredient' : 'Create Ingredient'}
                </Button>
                <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/ingredients')}>
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}
