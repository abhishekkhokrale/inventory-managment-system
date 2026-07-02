import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, IconButton, Typography, Avatar, Menu,
  MenuItem, Tooltip, Box, Divider, ListItemIcon
} from '@mui/material'
import {
  Menu as MenuIcon, Notifications, Logout,
  Person, Settings, DarkMode, LightMode
} from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { authApi } from '@/api/auth.api'

interface TopBarProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  drawerWidth: number
  isMobile: boolean
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { mode, toggleTheme } = useThemeStore()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
  }

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar>
        <IconButton edge="start" onClick={onToggleSidebar} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
          Kitchen Inventory System
        </Typography>

        <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
          <IconButton onClick={toggleTheme}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <IconButton>
            <Notifications />
          </IconButton>
        </Tooltip>

        <Tooltip title={user?.fullName || 'Account'}>
          <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>{user?.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null) }}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null) }}>
            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
