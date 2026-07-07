import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, TextField, Typography, Grid, Card, CardContent,
  MenuItem, CircularProgress, Breadcrumbs, Link,
  FormControlLabel, Switch, Chip, OutlinedInput, Select,
  FormControl, InputLabel, FormHelperText
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/api/axiosInstance'
import { useSnackbar } from 'notistack'

const createSchema = z.object({
  firstName:  z.string().min(1, 'First name is required'),
  lastName:   z.string().min(1, 'Last name is required'),
  username:   z.string().min(3, 'Username must be at least 3 characters'),
  email:      z.string().email('Invalid email'),
  phone:      z.string().optional(),
  password:   z.string().min(8, 'Password must be at least 8 characters'),
  roles:      z.array(z.string()).min(1, 'Assign at least one role'),
  active:     z.boolean().default(true),
})

const editSchema = z.object({
  firstName:  z.string().min(1, 'First name is required'),
  lastName:   z.string().min(1, 'Last name is required'),
  username:   z.string().min(3, 'Username must be at least 3 characters'),
  email:      z.string().email('Invalid email'),
  phone:      z.string().optional(),
  password:   z.string().optional(),
  roles:      z.array(z.string()).min(1, 'Assign at least one role'),
  active:     z.boolean().default(true),
})

type FormData = {
  firstName: string
  lastName: string
  username: string
  email: string
  phone?: string
  password?: string
  roles: string[]
  active: boolean
}

export default function UserFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { data: existing } = useQuery({
    queryKey: ['users', id],
    queryFn: () => axiosInstance.get(`/users/${id}`).then(r => r.data),
    enabled: isEdit,
    retry: false,
  })

  const { data: roleOptions = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => axiosInstance.get('/roles').then(r => r.data),
  })

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(isEdit ? editSchema : createSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      roles: [],
      active: true,
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        firstName: existing.firstName ?? '',
        lastName:  existing.lastName  ?? '',
        username:  existing.username  ?? '',
        email:     existing.email     ?? '',
        phone:     existing.phone     ?? '',
        password:  '',
        roles:     existing.roles?.map((r: any) => r.name ?? r) ?? [],
        active:    existing.active ?? true,
      })
    }
  }, [existing, reset])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { ...data, ...(data.password === '' ? { password: undefined } : {}) }
      return isEdit
        ? axiosInstance.put(`/users/${id}`, payload).then(r => r.data)
        : axiosInstance.post('/users', payload).then(r => r.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      enqueueSnackbar(`User ${isEdit ? 'updated' : 'created'} successfully`, { variant: 'success' })
      navigate('/users')
    },
    onError: (err: any) =>
      enqueueSnackbar(err.response?.data?.message || 'Operation failed — backend API not yet implemented', { variant: 'error' }),
  })

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" onClick={() => navigate('/users')} underline="hover" color="inherit">
          Users
        </Link>
        <Typography color="text.primary">{isEdit ? 'Edit User' : 'Add User'}</Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>{isEdit ? 'Edit User' : 'Add New User'}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/users')}>Back</Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit(data => mutate(data))}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Personal Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller name="firstName" control={control} render={({ field }) => (
                      <TextField {...field} label="First Name *" fullWidth InputLabelProps={{ shrink: true }}
                        error={!!errors.firstName} helperText={errors.firstName?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="lastName" control={control} render={({ field }) => (
                      <TextField {...field} label="Last Name *" fullWidth InputLabelProps={{ shrink: true }}
                        error={!!errors.lastName} helperText={errors.lastName?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="email" control={control} render={({ field }) => (
                      <TextField {...field} label="Email *" type="email" fullWidth InputLabelProps={{ shrink: true }}
                        error={!!errors.email} helperText={errors.email?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="phone" control={control} render={({ field }) => (
                      <TextField {...field} label="Phone" fullWidth InputLabelProps={{ shrink: true }} />
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Account Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller name="username" control={control} render={({ field }) => (
                      <TextField {...field} label="Username *" fullWidth InputLabelProps={{ shrink: true }}
                        error={!!errors.username} helperText={errors.username?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller name="password" control={control} render={({ field }) => (
                      <TextField {...field} label={isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
                        type="password" fullWidth InputLabelProps={{ shrink: true }}
                        error={!!errors.password} helperText={errors.password?.message} />
                    )} />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller name="roles" control={control} render={({ field }) => (
                      <FormControl fullWidth error={!!errors.roles}>
                        <InputLabel>Roles *</InputLabel>
                        <Select
                          multiple
                          value={field.value}
                          onChange={field.onChange}
                          input={<OutlinedInput label="Roles *" />}
                          renderValue={(selected) => (
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {(selected as string[]).map(v => (
                                <Chip key={v} label={v.replace(/_/g, ' ')} size="small" color="primary" variant="outlined" />
                              ))}
                            </Box>
                          )}
                        >
                          {roleOptions.map((role: any) => (
                            <MenuItem key={role.id} value={role.name}>
                              {role.name.replace(/_/g, ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.roles && <FormHelperText>{errors.roles.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Status</Typography>
                <Controller name="active" control={control} render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                    label={field.value ? 'Active' : 'Inactive'}
                  />
                )} />
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Inactive users cannot log in.
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
                  {isEdit ? 'Update User' : 'Create User'}
                </Button>
                <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate('/users')}>
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
