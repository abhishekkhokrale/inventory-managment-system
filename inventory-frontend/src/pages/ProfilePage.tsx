import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, TextField, Avatar,
  Button, Divider, CircularProgress
} from '@mui/material'
import { Save } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import axiosInstance from '@/api/axiosInstance'
import { useSnackbar } from 'notistack'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { enqueueSnackbar } = useSnackbar()

  const [currentPassword, setCurrentPassword]   = useState('')
  const [newPassword, setNewPassword]             = useState('')
  const [confirmPassword, setConfirmPassword]     = useState('')
  const [errors, setErrors]                       = useState<Record<string, string>>({})

  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string }) =>
      axiosInstance.post('/auth/change-password', body, {
        headers: { 'X-User-Id': user?.userId || '' },
      }).then(r => r.data),
    onSuccess: () => {
      enqueueSnackbar('Password changed successfully', { variant: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors({})
    },
    onError: (err: any) =>
      enqueueSnackbar(err.response?.data?.message || 'Failed to change password', { variant: 'error' }),
  })

  const handleSubmit = () => {
    const next: Record<string, string> = {}
    if (!currentPassword)                       next.currentPassword = 'Current password is required'
    if (!newPassword)                           next.newPassword     = 'New password is required'
    else if (newPassword.length < 8)            next.newPassword     = 'Minimum 8 characters'
    if (newPassword !== confirmPassword)        next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    if (Object.keys(next).length === 0) changePassword({ currentPassword, newPassword })
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>My Profile</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: 36, mx: 'auto', mb: 2 }}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h6" fontWeight={600}>{user?.fullName}</Typography>
              <Typography color="text.secondary" variant="body2">{user?.email}</Typography>
              <Box display="flex" justifyContent="center" gap={1} mt={2} flexWrap="wrap">
                {user?.roles?.map(role => (
                  <Typography key={role} variant="caption" sx={{
                    bgcolor: 'primary.main', color: 'white', px: 1.5, py: 0.5, borderRadius: 1,
                  }}>
                    {role.replace('ROLE_', '').replace(/_/g, ' ')}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Personal Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="First Name" value={user?.fullName?.split(' ')[0] || ''} fullWidth disabled />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Last Name" value={user?.fullName?.split(' ').slice(1).join(' ') || ''} fullWidth disabled />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Email" value={user?.email || ''} fullWidth disabled />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Username" value={user?.username || ''} fullWidth disabled />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" fontWeight={600} mb={2}>Change Password</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Current Password" type="password" fullWidth
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="New Password" type="password" fullWidth
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Confirm New Password" type="password" fullWidth
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={handleSubmit}
                disabled={isPending}
                startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <Save />}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
