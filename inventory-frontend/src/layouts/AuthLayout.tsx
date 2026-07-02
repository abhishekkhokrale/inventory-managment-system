import { Outlet } from 'react-router-dom'
import { Box, Container, Paper, Typography } from '@mui/material'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <RestaurantMenuIcon sx={{ fontSize: 56, color: 'white', mb: 1 }} />
          <Typography variant="h4" fontWeight={700} color="white">
            Kitchen Inventory
          </Typography>
          <Typography variant="subtitle1" color="rgba(255,255,255,0.8)">
            Food Industry Management System
          </Typography>
        </Box>
        <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  )
}
