import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, TextField, Typography, Grid, Card, CardContent,
  InputAdornment, CircularProgress, Breadcrumbs, Link
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { Rating } from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/api/axiosInstance'
import { useSnackbar } from 'notistack'

const schema = z.object({
  name:          z.string().min(1, 'Name is required'),
  code:          z.string().min(1, 'Code is required'),
  contactPerson: z.string().optional(),
  email:         z.string().email('Invalid email').optional().or(z.literal('')),
  phone:         z.string().optional(),
  address:       z.string().optional(),
  city:          z.string().optional(),
  country:       z.string().optional(),
  taxNumber:     z.string().optional(),
  paymentTerms:  z.string().optional(),
  leadTimeDays:  z.coerce.number().min(0).optional(),
  rating:        z.coerce.number().min(0).max(5).optional(),
  website:       z.string().optional(),
  notes:         z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function SupplierFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data: existing } = useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => axiosInstance.get(`/suppliers/${id}`).then(r => r.data),
    enabled: isEdit,
  })

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { leadTimeDays: 7, rating: 0 },
  })

  useEffect(() => {
    if (existing) {
      reset({
        name:          existing.name,
        code:          existing.code,
        contactPerson: existing.contactPerson,
        email:         existing.email,
        phone:         existing.phone,
        address:       existing.address,
        city:          existing.city,
        country:       existing.country,
        taxNumber:     existing.taxNumber,
        paymentTerms:  existing.paymentTerms,
        leadTimeDays:  existing.leadTimeDays,
        rating:        existing.rating,
        website:       existing.website,
        notes:         existing.notes,
      })
    }
  }, [existing, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? axiosInstance.put(`/suppliers/${id}`, data).then(r => r.data)
        : axiosInstance.post('/suppliers', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      enqueueSnackbar(`Supplier ${isEdit ? 'updated' : 'created'} successfully`, { variant: 'success' })
      navigate('/suppliers')
    },
    onError: (err: any) =>
      enqueueSnackbar(err.response?.data?.message || 'Operation failed', { variant: 'error' }),
  })

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate('/suppliers')} underline="hover" color="inherit">
          Suppliers
        </Link>
        <Typography color="text.primary">{isEdit ? 'Edit' : 'New'} Supplier</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/suppliers')}>Back</Button>
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
                      <TextField {...field} label="Supplier Name *" fullWidth
                        error={!!errors.name} helperText={errors.name?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="code" control={control} render={({ field }) => (
                      <TextField {...field} label="Code *" fullWidth
                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                        error={!!errors.code} helperText={errors.code?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="contactPerson" control={control} render={({ field }) => (
                      <TextField {...field} label="Contact Person" fullWidth />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="email" control={control} render={({ field }) => (
                      <TextField {...field} label="Email" fullWidth type="email"
                        error={!!errors.email} helperText={errors.email?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="phone" control={control} render={({ field }) => (
                      <TextField {...field} label="Phone" fullWidth />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="website" control={control} render={({ field }) => (
                      <TextField {...field} label="Website" fullWidth />
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Address</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller name="address" control={control} render={({ field }) => (
                      <TextField {...field} label="Street Address" fullWidth />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="city" control={control} render={({ field }) => (
                      <TextField {...field} label="City" fullWidth />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="country" control={control} render={({ field }) => (
                      <TextField {...field} label="Country" fullWidth />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="taxNumber" control={control} render={({ field }) => (
                      <TextField {...field} label="Tax Number / GST" fullWidth />
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Business Terms</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller name="paymentTerms" control={control} render={({ field }) => (
                      <TextField {...field} label="Payment Terms" fullWidth placeholder="e.g., Net 30, COD" />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="leadTimeDays" control={control} render={({ field }) => (
                      <TextField {...field} label="Lead Time" fullWidth type="number"
                        InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }} />
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller name="notes" control={control} render={({ field }) => (
                      <TextField {...field} label="Notes" fullWidth multiline rows={3} />
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Supplier Rating</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>Quality Rating</Typography>
                <Controller name="rating" control={control} render={({ field }) => (
                  <Rating
                    value={Number(field.value) || 0}
                    onChange={(_, v) => field.onChange(v ?? 0)}
                    precision={0.5}
                    size="large"
                  />
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
                  {isEdit ? 'Update Supplier' : 'Create Supplier'}
                </Button>
                <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/suppliers')}>
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
