import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, TextField, Typography, Grid, Card, CardContent,
  MenuItem, CircularProgress, Breadcrumbs, Link, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, Divider,
  Alert
} from '@mui/material'
import { ArrowBack, Save, Add, Delete } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/api/axiosInstance'
import { useSnackbar } from 'notistack'

const STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED']

const itemSchema = z.object({
  ingredientId:  z.coerce.number().min(1, 'Required'),
  quantity:      z.coerce.number().min(0.01, 'Must be > 0'),
  unitPrice:     z.coerce.number().min(0, 'Required'),
  description:   z.string().optional(),
})

const schema = z.object({
  supplierId:           z.coerce.number().min(1, 'Supplier is required'),
  orderDate:            z.string().min(1, 'Order date is required'),
  expectedDeliveryDate: z.string().optional(),
  status:               z.string().min(1, 'Status is required'),
  paymentTerms:         z.string().optional(),
  deliveryAddress:      z.string().optional(),
  remarks:              z.string().optional(),
  items:                z.array(itemSchema).min(1, 'Add at least one item'),
})
type FormData = z.infer<typeof schema>

export default function PurchaseOrderFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const [noBackend] = useState(true)

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () => axiosInstance.get('/suppliers', { params: { size: 200 } }).then(r => r.data?.content ?? []),
  })

  const { data: ingredients = [] } = useQuery({
    queryKey: ['ingredients-list'],
    queryFn: () => axiosInstance.get('/ingredients', { params: { size: 500 } }).then(r => r.data?.content ?? []),
  })

  const { data: existing } = useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: () => axiosInstance.get(`/purchase-orders/${id}`).then(r => r.data),
    enabled: isEdit,
    retry: false,
  })

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'DRAFT',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      paymentTerms: '',
      deliveryAddress: '',
      remarks: '',
      items: [{ ingredientId: 0, quantity: 1, unitPrice: 0, description: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = watch('items')

  const totalAmount = watchedItems?.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0) ?? 0

  useEffect(() => {
    if (existing) {
      reset({
        supplierId:           existing.supplier?.id,
        orderDate:            existing.orderDate,
        expectedDeliveryDate: existing.expectedDeliveryDate,
        status:               existing.status,
        paymentTerms:         existing.paymentTerms,
        deliveryAddress:      existing.deliveryAddress,
        remarks:              existing.remarks,
        items:                existing.items?.map((i: any) => ({
          ingredientId: i.ingredient?.id,
          quantity:     i.quantity,
          unitPrice:    i.unitPrice,
          description:  i.description,
        })) ?? [],
      })
    }
  }, [existing, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? axiosInstance.put(`/purchase-orders/${id}`, data).then(r => r.data)
        : axiosInstance.post('/purchase-orders', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      enqueueSnackbar(`Purchase order ${isEdit ? 'updated' : 'created'} successfully`, { variant: 'success' })
      navigate('/purchases')
    },
    onError: (err: any) =>
      enqueueSnackbar(err.response?.data?.message || 'Operation failed — backend API not yet implemented', { variant: 'error' }),
  })

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate('/purchases')} underline="hover" color="inherit">
          Purchase Orders
        </Link>
        <Typography color="text.primary">{isEdit ? 'Edit' : 'New'} Purchase Order</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/purchases')}>Back</Button>
      </Box>

      {noBackend && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Purchase Order API endpoints are not yet implemented in the backend. This form is ready for when they are added.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(data => mutate(data))}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Order Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller name="supplierId" control={control} render={({ field }) => (
                      <TextField {...field} select label="Supplier *" fullWidth
                        error={!!errors.supplierId} helperText={errors.supplierId?.message}>
                        {suppliers.map((s: any) => (
                          <MenuItem key={s.id} value={s.id}>{s.name} ({s.code})</MenuItem>
                        ))}
                      </TextField>
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="orderDate" control={control} render={({ field }) => (
                      <TextField {...field} label="Order Date *" type="date" fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.orderDate} helperText={errors.orderDate?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="expectedDeliveryDate" control={control} render={({ field }) => (
                      <TextField {...field} label="Expected Delivery Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="status" control={control} render={({ field }) => (
                      <TextField {...field} select label="Status *" fullWidth
                        error={!!errors.status} helperText={errors.status?.message}>
                        {STATUSES.map(s => (
                          <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>
                        ))}
                      </TextField>
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="paymentTerms" control={control} render={({ field }) => (
                      <TextField {...field} label="Payment Terms" fullWidth placeholder="e.g., Net 30, COD"
                        InputLabelProps={{ shrink: true }} />
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller name="deliveryAddress" control={control} render={({ field }) => (
                      <TextField {...field} label="Delivery Address" fullWidth multiline rows={2}
                        InputLabelProps={{ shrink: true }} />
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller name="remarks" control={control} render={({ field }) => (
                      <TextField {...field} label="Remarks / Notes" fullWidth multiline rows={2}
                        InputLabelProps={{ shrink: true }} />
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Order Items
                    {errors.items?.root && (
                      <Typography variant="caption" color="error" ml={1}>
                        {errors.items.root.message}
                      </Typography>
                    )}
                  </Typography>
                  <Button size="small" startIcon={<Add />} onClick={() =>
                    append({ ingredientId: 0, quantity: 1, unitPrice: 0, description: '' })
                  }>
                    Add Item
                  </Button>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ingredient</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell width={40} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, i) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Controller name={`items.${i}.ingredientId`} control={control} render={({ field: f }) => (
                            <TextField {...f} select size="small" fullWidth
                              error={!!errors.items?.[i]?.ingredientId}>
                              {ingredients.map((ing: any) => (
                                <MenuItem key={ing.id} value={ing.id}>{ing.name}</MenuItem>
                              ))}
                            </TextField>
                          )} />
                        </TableCell>
                        <TableCell sx={{ width: 90 }}>
                          <Controller name={`items.${i}.quantity`} control={control} render={({ field: f }) => (
                            <TextField {...f} size="small" type="number" fullWidth inputProps={{ min: 0, step: 0.01 }}
                              error={!!errors.items?.[i]?.quantity} />
                          )} />
                        </TableCell>
                        <TableCell sx={{ width: 110 }}>
                          <Controller name={`items.${i}.unitPrice`} control={control} render={({ field: f }) => (
                            <TextField {...f} size="small" type="number" fullWidth inputProps={{ min: 0, step: 0.01 }}
                              error={!!errors.items?.[i]?.unitPrice} />
                          )} />
                        </TableCell>
                        <TableCell>
                          ₹{((Number(watchedItems?.[i]?.quantity) || 0) * (Number(watchedItems?.[i]?.unitPrice) || 0)).toFixed(2)}
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
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Order Summary</Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight={600}>₹{totalAmount.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography fontWeight={700}>Total</Typography>
                  <Typography fontWeight={700} color="primary.main">₹{totalAmount.toFixed(2)}</Typography>
                </Box>
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
                  {isEdit ? 'Update Order' : 'Create Order'}
                </Button>
                <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/purchases')}>
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
