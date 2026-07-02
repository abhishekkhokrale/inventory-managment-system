import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box, Button, TextField, Typography, Alert, InputAdornment,
  IconButton, CircularProgress, Divider
} from '@mui/material'
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'
import { AuthUser } from '@/types'

const schema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate: login, isPending, error } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const user: AuthUser = {
        userId: data.userId,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        roles: data.roles,
        permissions: data.permissions,
      }
      setAuth(user, data.accessToken, data.refreshToken)
      navigate(from, { replace: true })
    },
  })

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Welcome Back
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Sign in to your kitchen inventory account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Invalid credentials. Please try again.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(data => login(data))} noValidate>
        <TextField
          {...register('usernameOrEmail')}
          label="Username or Email"
          fullWidth
          margin="normal"
          error={!!errors.usernameOrEmail}
          helperText={errors.usernameOrEmail?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><Person color="action" /></InputAdornment>
            ),
          }}
        />
        <TextField
          {...register('password')}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><Lock color="action" /></InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box textAlign="right" mt={1} mb={2}>
          <Link to="/forgot-password" style={{ color: '#2E7D32', textDecoration: 'none', fontSize: 14 }}>
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isPending}
          sx={{ py: 1.5, fontWeight: 700 }}
        >
          {isPending ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
        </Button>
      </Box>
    </Box>
  )
}
