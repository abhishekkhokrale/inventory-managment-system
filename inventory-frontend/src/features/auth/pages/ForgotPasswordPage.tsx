import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: () => setSubmitted(true),
  })

  if (submitted) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Check your email</Typography>
        <Typography color="text.secondary" mb={3}>
          If an account exists for <strong>{email}</strong>, you will receive a password reset link.
        </Typography>
        <Link to="/login" style={{ color: '#2E7D32' }}>
          <Button startIcon={<ArrowBack />}>Back to Login</Button>
        </Link>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Forgot Password</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>
      <TextField
        label="Email Address"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        fullWidth
        size="large"
        disabled={!email || isPending}
        onClick={() => mutate()}
        sx={{ mt: 2, py: 1.5 }}
      >
        {isPending ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
      </Button>
      <Box textAlign="center" mt={2}>
        <Link to="/login" style={{ color: '#2E7D32', fontSize: 14 }}>Back to Login</Link>
      </Box>
    </Box>
  )
}
