import { Grid, Box, Typography, Alert } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard.api'
import KPICard from '../components/KPICard'
import InventoryTrendChart from '../components/InventoryTrendChart'
import TopConsumedChart from '../components/TopConsumedChart'
import WasteAnalysisChart from '../components/WasteAnalysisChart'
import LowStockAlerts from '../components/LowStockAlerts'
import {
  Inventory2, Warning, ShoppingCart, TrendingDown,
  LocalShipping, AttachMoney, Delete, Restaurant
} from '@mui/icons-material'

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => dashboardApi.getKPIs(),
  })

  const { data: trends } = useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: () => dashboardApi.getInventoryTrends(undefined, 30),
  })

  const { data: topConsumed } = useQuery({
    queryKey: ['dashboard', 'top-consumed'],
    queryFn: () => dashboardApi.getTopConsumed(undefined, 10),
  })

  const { data: wasteData } = useQuery({
    queryKey: ['dashboard', 'waste'],
    queryFn: () => dashboardApi.getWasteAnalysis(undefined, 30),
  })

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Ingredients"
            value={kpis?.totalIngredients ?? 0}
            icon={<Inventory2 />}
            color="#2E7D32"
            loading={kpisLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Stock Value"
            value={`₹${(kpis?.totalStockValue ?? 0).toLocaleString()}`}
            icon={<AttachMoney />}
            color="#1565C0"
            loading={kpisLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Low Stock Items"
            value={kpis?.lowStockItems ?? 0}
            icon={<Warning />}
            color="#E65100"
            trend={kpis?.lowStockItems ? 'warning' : 'success'}
            loading={kpisLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Expiring Soon"
            value={kpis?.expiringItems ?? 0}
            icon={<TrendingDown />}
            color="#C62828"
            trend={kpis?.expiringItems ? 'danger' : 'success'}
            loading={kpisLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Pending POs"
            value={kpis?.pendingPurchaseOrders ?? 0}
            icon={<ShoppingCart />}
            color="#6A1B9A"
            loading={kpisLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Today's Consumption"
            value={kpis?.todayConsumption ?? 0}
            icon={<Restaurant />}
            color="#00695C"
            loading={kpisLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Waste This Month"
            value={`₹${(kpis?.wasteThisMonth ?? 0).toLocaleString()}`}
            icon={<Delete />}
            color="#AD1457"
            loading={kpisLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Suppliers"
            value={kpis?.activeSuppliers ?? 0}
            icon={<LocalShipping />}
            color="#F57F17"
            loading={kpisLoading}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <InventoryTrendChart data={trends ?? []} />
        </Grid>
        <Grid item xs={12} md={4}>
          <LowStockAlerts />
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TopConsumedChart data={topConsumed ?? []} />
        </Grid>
        <Grid item xs={12} md={6}>
          <WasteAnalysisChart data={wasteData ?? []} />
        </Grid>
      </Grid>
    </Box>
  )
}
