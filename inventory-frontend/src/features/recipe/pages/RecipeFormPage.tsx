import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, TextField, Typography, Grid, Card, CardContent,
  MenuItem, CircularProgress, Breadcrumbs, Link, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, Switch,
  FormControlLabel, Alert, InputAdornment
} from '@mui/material'
import { ArrowBack, Save, Add, Delete } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/api/axiosInstance'
import { useSnackbar } from 'notistack'

const ingredientSchema = z.object({
  ingredientId: z.coerce.number().min(1, 'Required'),
  quantity:     z.coerce.number().min(0.001, 'Must be > 0'),
  unit:         z.string().min(1, 'Required'),
  notes:        z.string().optional(),
})

const schema = z.object({
  name:                   z.string().min(1, 'Name is required'),
  code:                   z.string().min(1, 'Code is required'),
  description:            z.string().optional(),
  yieldQuantity:          z.coerce.number().min(0.01, 'Required'),
  yieldUnit:              z.string().min(1, 'Required'),
  servingSize:            z.coerce.number().optional(),
  preparationTimeMinutes: z.coerce.number().min(0).optional(),
  cookingTimeMinutes:     z.coerce.number().min(0).optional(),
  instructions:           z.string().optional(),
  published:              z.boolean().default(false),
  ingredients:            z.array(ingredientSchema).min(1, 'Add at least one ingredient'),
})
type FormData = z.infer<typeof schema>

export default function RecipeFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data: ingredientOptions = [] } = useQuery({
    queryKey: ['ingredients-list'],
    queryFn: () => axiosInstance.get('/ingredients', { params: { size: 500 } }).then(r => r.data?.content ?? []),
  })

  const { data: existing } = useQuery({
    queryKey: ['recipes', id],
    queryFn: () => axiosInstance.get(`/recipes/${id}`).then(r => r.data),
    enabled: isEdit,
    retry: false,
  })

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      published: false,
      yieldQuantity: 1,
      yieldUnit: 'portion',
      preparationTimeMinutes: 0,
      cookingTimeMinutes: 0,
      ingredients: [{ ingredientId: 0, quantity: 1, unit: 'kg', notes: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' })

  useEffect(() => {
    if (existing) {
      reset({
        name:                   existing.name,
        code:                   existing.code,
        description:            existing.description,
        yieldQuantity:          existing.yieldQuantity,
        yieldUnit:              existing.yieldUnit,
        servingSize:            existing.servingSize,
        preparationTimeMinutes: existing.preparationTimeMinutes,
        cookingTimeMinutes:     existing.cookingTimeMinutes,
        instructions:           existing.instructions,
        published:              existing.published,
        ingredients:            existing.ingredients?.map((i: any) => ({
          ingredientId: i.ingredient?.id,
          quantity:     i.quantity,
          unit:         i.unit,
          notes:        i.notes,
        })) ?? [],
      })
    }
  }, [existing, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? axiosInstance.put(`/recipes/${id}`, data).then(r => r.data)
        : axiosInstance.post('/recipes', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      enqueueSnackbar(`Recipe ${isEdit ? 'updated' : 'created'} successfully`, { variant: 'success' })
      navigate('/recipes')
    },
    onError: (err: any) =>
      enqueueSnackbar(err.response?.data?.message || 'Operation failed — backend API not yet implemented', { variant: 'error' }),
  })

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate('/recipes')} underline="hover" color="inherit">
          Recipes
        </Link>
        <Typography color="text.primary">{isEdit ? 'Edit' : 'New'} Recipe</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Edit Recipe' : 'New Recipe'}
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/recipes')}>Back</Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Recipe API endpoints are not yet implemented in the backend. This form is ready for when they are added.
      </Alert>

      <Box component="form" onSubmit={handleSubmit(data => mutate(data))}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Controller name="name" control={control} render={({ field }) => (
                      <TextField {...field} label="Recipe Name *" fullWidth
                        error={!!errors.name} helperText={errors.name?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller name="code" control={control} render={({ field }) => (
                      <TextField {...field} label="Code *" fullWidth
                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                        error={!!errors.code} helperText={errors.code?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller name="description" control={control} render={({ field }) => (
                      <TextField {...field} label="Description" fullWidth multiline rows={2} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller name="yieldQuantity" control={control} render={({ field }) => (
                      <TextField {...field} label="Yield Quantity *" type="number" fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                        error={!!errors.yieldQuantity} helperText={errors.yieldQuantity?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller name="yieldUnit" control={control} render={({ field }) => (
                      <TextField {...field} label="Yield Unit *" fullWidth placeholder="portion, kg, litre…"
                        error={!!errors.yieldUnit} helperText={errors.yieldUnit?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller name="servingSize" control={control} render={({ field }) => (
                      <TextField {...field} label="Serving Size" type="number" fullWidth inputProps={{ min: 0, step: 0.01 }} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="preparationTimeMinutes" control={control} render={({ field }) => (
                      <TextField {...field} label="Prep Time" type="number" fullWidth
                        InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
                        inputProps={{ min: 0 }} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="cookingTimeMinutes" control={control} render={({ field }) => (
                      <TextField {...field} label="Cooking Time" type="number" fullWidth
                        InputProps={{ endAdornment: <InputAdornment position="end">min</InputAdornment> }}
                        inputProps={{ min: 0 }} />
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller name="instructions" control={control} render={({ field }) => (
                      <TextField {...field} label="Preparation Instructions" fullWidth multiline rows={5}
                        placeholder="Step-by-step instructions…" />
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Ingredients
                    {errors.ingredients?.root && (
                      <Typography variant="caption" color="error" ml={1}>
                        {errors.ingredients.root.message}
                      </Typography>
                    )}
                  </Typography>
                  <Button size="small" startIcon={<Add />} onClick={() =>
                    append({ ingredientId: 0, quantity: 1, unit: 'kg', notes: '' })
                  }>
                    Add Ingredient
                  </Button>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ingredient</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell width={40} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, i) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Controller name={`ingredients.${i}.ingredientId`} control={control} render={({ field: f }) => (
                            <TextField {...f} select size="small" fullWidth
                              error={!!errors.ingredients?.[i]?.ingredientId}>
                              {ingredientOptions.map((ing: any) => (
                                <MenuItem key={ing.id} value={ing.id}>{ing.name}</MenuItem>
                              ))}
                            </TextField>
                          )} />
                        </TableCell>
                        <TableCell sx={{ width: 100 }}>
                          <Controller name={`ingredients.${i}.quantity`} control={control} render={({ field: f }) => (
                            <TextField {...f} size="small" type="number" fullWidth
                              inputProps={{ min: 0, step: 0.001 }}
                              error={!!errors.ingredients?.[i]?.quantity} />
                          )} />
                        </TableCell>
                        <TableCell sx={{ width: 100 }}>
                          <Controller name={`ingredients.${i}.unit`} control={control} render={({ field: f }) => (
                            <TextField {...f} size="small" fullWidth placeholder="kg, g, ml…"
                              error={!!errors.ingredients?.[i]?.unit} />
                          )} />
                        </TableCell>
                        <TableCell>
                          <Controller name={`ingredients.${i}.notes`} control={control} render={({ field: f }) => (
                            <TextField {...f} size="small" fullWidth placeholder="optional…" />
                          )} />
                        </TableCell>
                        <TableCell>
                          {fields.length > 1 && (
                            <IconButton size="small" color="error" onClick={() => remove(i)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Publishing</Typography>
                <Controller name="published" control={control} render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                    label={field.value ? 'Published' : 'Draft'}
                  />
                )} />
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Published recipes are visible to kitchen staff.
                </Typography>
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
                  {isEdit ? 'Update Recipe' : 'Create Recipe'}
                </Button>
                <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/recipes')}>
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
