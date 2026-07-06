import { Box, Typography, Button } from '@mui/material'
import { Lock } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={2}>
      <Lock sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h5" fontWeight={700}>Access Denied</Typography>
      <Typography color="text.secondary">Your role doesn't have permission to view this page.</Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
    </Box>
  )
}
