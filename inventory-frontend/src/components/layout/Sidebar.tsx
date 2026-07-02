import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Collapse, useTheme
} from '@mui/material'
import {
  Dashboard, Kitchen, Inventory2, ShoppingCart, People, Restaurant,
  Assessment, LocalShipping, ExpandLess, ExpandMore, Warehouse
} from '@mui/icons-material'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

interface NavItem {
  label: string
  path?: string
  icon: React.ReactNode
  permission?: string
  children?: NavItem[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     path: '/dashboard',   icon: <Dashboard />,          permission: 'DASHBOARD_VIEW' },
  {
    label: 'Inventory',     icon: <Inventory2 />,
    children: [
      { label: 'Ingredients',   path: '/ingredients',         icon: <Kitchen />,     permission: 'INGREDIENT_READ' },
      { label: 'Stock Levels',  path: '/stock',               icon: <Warehouse />,   permission: 'INVENTORY_READ' },
      { label: 'Transactions',  path: '/stock/transactions',  icon: <Assessment />,  permission: 'INVENTORY_READ' },
    ],
  },
  { label: 'Suppliers',     path: '/suppliers',   icon: <LocalShipping />,       permission: 'SUPPLIER_READ' },
  {
    label: 'Purchases',     icon: <ShoppingCart />,
    children: [
      { label: 'Purchase Orders', path: '/purchases', icon: <ShoppingCart />, permission: 'PURCHASE_READ' },
    ],
  },
  { label: 'Recipes',       path: '/recipes',     icon: <Restaurant />,          permission: 'RECIPE_READ' },
  { label: 'Reports',       path: '/reports',     icon: <Assessment />,          permission: 'REPORT_VIEW' },
  { label: 'Users',         path: '/users',       icon: <People />,              permission: 'USER_READ' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
  drawerWidth: number
  isMobile: boolean
}

export default function Sidebar({ open, onClose, drawerWidth, isMobile }: SidebarProps) {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()
  const [expanded, setExpanded] = useState<string[]>(['Inventory'])

  const toggleExpand = (label: string) => {
    setExpanded(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  const isActive = (path?: string) => path ? location.pathname === path : false
  const isGroupActive = (children?: NavItem[]) =>
    children?.some(c => location.pathname.startsWith(c.path || ''))

  const renderNavItem = (item: NavItem, depth = 0) => {
    if (item.permission && !hasPermission(item.permission)) return null

    if (item.children) {
      const active = isGroupActive(item.children)
      const open = expanded.includes(item.label)
      return (
        <Box key={item.label}>
          <ListItemButton
            onClick={() => toggleExpand(item.label)}
            sx={{
              pl: 2 + depth * 2,
              borderRadius: 1,
              mx: 1,
              color: active ? 'primary.main' : 'text.primary',
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 600 : 400 }} />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children.map(child => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        </Box>
      )
    }

    const active = isActive(item.path)
    return (
      <ListItem key={item.label} disablePadding sx={{ px: 1, mb: 0.5 }}>
        <ListItemButton
          selected={active}
          onClick={() => { navigate(item.path!); if (isMobile) onClose() }}
          sx={{
            borderRadius: 1,
            pl: 2 + depth * 2,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '& .MuiListItemIcon-root': { color: 'white' },
              '&:hover': { backgroundColor: 'primary.dark' },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: active ? 'white' : 'inherit' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 600 : 400 }} />
        </ListItemButton>
      </ListItem>
    )
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Kitchen sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="primary.main" lineHeight={1.2}>
            KitchenIMS
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Inventory System
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List dense>
          {NAV_ITEMS.map(item => renderNavItem(item))}
        </List>
      </Box>
    </Box>
  )

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}
