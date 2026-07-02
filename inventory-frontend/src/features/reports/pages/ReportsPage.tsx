import { useState } from 'react'
import {
  Box, Typography, Tabs, Tab, Card, CardContent, Grid,
  TextField, Button, FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import { FileDownload, PictureAsPdf, TableChart } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line
} from 'recharts'
import axiosInstance from '@/api/axiosInstance'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'

type ReportTab = 'stock' | 'consumption' | 'purchase' | 'waste' | 'cost' | 'valuation'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('stock')
  const [fromDate, setFromDate] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'))
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'))

  const exportExcel = async () => {
    const { utils, writeFileXLSX } = await import('xlsx')
    // Build worksheet from report data and export
    const ws = utils.json_to_sheet([{ message: 'Export functionality — connect to report API endpoint' }])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Report')
    writeFileXLSX(wb, `report-${activeTab}-${dayjs().format('YYYYMMDD')}.xlsx`)
  }

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`Kitchen Inventory - ${activeTab.toUpperCase()} Report`, 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}`, 14, 28)
    autoTable(doc, {
      head: [['Item', 'Quantity', 'Value']],
      body: [['Sample data', '0', '₹0.00']],
      startY: 35,
    })
    doc.save(`report-${activeTab}-${dayjs().format('YYYYMMDD')}.pdf`)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Reports & Analytics</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<TableChart />} onClick={exportExcel}>Export Excel</Button>
          <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={exportPDF} color="error">Export PDF</Button>
        </Box>
      </Box>

      {/* Date Range Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField size="small" label="From Date" type="date" fullWidth
                value={fromDate} onChange={e => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField size="small" label="To Date" type="date" fullWidth
                value={toDate} onChange={e => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item>
              <Button variant="contained" startIcon={<FileDownload />}>Generate</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}
        variant="scrollable" scrollButtons="auto">
        <Tab value="stock"      label="Stock Report" />
        <Tab value="consumption" label="Consumption" />
        <Tab value="purchase"   label="Purchase Report" />
        <Tab value="waste"      label="Waste Report" />
        <Tab value="cost"       label="Cost Analysis" />
        <Tab value="valuation"  label="Inventory Valuation" />
      </Tabs>

      {activeTab === 'stock' && <StockReport fromDate={fromDate} toDate={toDate} />}
      {activeTab === 'consumption' && <ConsumptionReport fromDate={fromDate} toDate={toDate} />}
      {activeTab === 'purchase' && <PurchaseReport fromDate={fromDate} toDate={toDate} />}
      {activeTab === 'waste' && <WasteReport fromDate={fromDate} toDate={toDate} />}
      {activeTab === 'cost' && <CostAnalysis fromDate={fromDate} toDate={toDate} />}
      {activeTab === 'valuation' && <InventoryValuation />}
    </Box>
  )
}

function StockReport({ fromDate, toDate }: { fromDate: string; toDate: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'stock', fromDate, toDate],
    queryFn: () => axiosInstance.get('/reports/stock', { params: { fromDate, toDate } }).then(r => r.data),
  })

  const columns: GridColDef[] = [
    { field: 'ingredientName', headerName: 'Ingredient', flex: 1 },
    { field: 'category',       headerName: 'Category', width: 130 },
    { field: 'warehouse',      headerName: 'Warehouse', width: 130 },
    { field: 'openingStock',   headerName: 'Opening', width: 110, type: 'number' },
    { field: 'stockIn',        headerName: 'Stock In', width: 110, type: 'number' },
    { field: 'stockOut',       headerName: 'Stock Out', width: 110, type: 'number' },
    { field: 'closingStock',   headerName: 'Closing', width: 110, type: 'number' },
    { field: 'value',          headerName: 'Value (₹)', width: 120, type: 'number' },
  ]

  return (
    <DataGrid
      rows={data?.content ?? []}
      columns={columns}
      loading={isLoading}
      autoHeight
      sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
    />
  )
}

function ConsumptionReport({ fromDate, toDate }: { fromDate: string; toDate: string }) {
  const { data } = useQuery({
    queryKey: ['reports', 'consumption', fromDate, toDate],
    queryFn: () => axiosInstance.get('/reports/consumption', { params: { fromDate, toDate } }).then(r => r.data),
  })

  return (
    <Card>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data ?? []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#2E7D32" name="Consumption (units)" />
            <Bar dataKey="cost" fill="#1565C0" name="Cost (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function PurchaseReport({ fromDate, toDate }: { fromDate: string; toDate: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'purchase', fromDate, toDate],
    queryFn: () => axiosInstance.get('/reports/purchase', { params: { fromDate, toDate } }).then(r => r.data),
  })

  const columns: GridColDef[] = [
    { field: 'orderNumber', headerName: 'PO Number', width: 140 },
    { field: 'supplier',    headerName: 'Supplier', flex: 1 },
    { field: 'orderDate',   headerName: 'Order Date', width: 120 },
    { field: 'status',      headerName: 'Status', width: 130 },
    { field: 'totalAmount', headerName: 'Amount (₹)', width: 120, type: 'number' },
  ]

  return (
    <DataGrid
      rows={data?.content ?? []}
      columns={columns}
      loading={isLoading}
      autoHeight
      sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
    />
  )
}

function WasteReport({ fromDate, toDate }: { fromDate: string; toDate: string }) {
  const { data } = useQuery({
    queryKey: ['reports', 'waste', fromDate, toDate],
    queryFn: () => axiosInstance.get('/reports/waste', { params: { fromDate, toDate } }).then(r => r.data),
  })

  return (
    <Card>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data ?? []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="wasteQuantity" stroke="#C62828" name="Waste (units)" strokeWidth={2} />
            <Line type="monotone" dataKey="wasteCost" stroke="#E65100" name="Waste Cost (₹)" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CostAnalysis({ fromDate, toDate }: { fromDate: string; toDate: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>Cost Analysis</Typography>
        <Typography color="text.secondary">
          Configure cost analysis parameters and generate detailed breakdowns.
        </Typography>
      </CardContent>
    </Card>
  )
}

function InventoryValuation() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'valuation'],
    queryFn: () => axiosInstance.get('/reports/valuation').then(r => r.data),
  })

  const columns: GridColDef[] = [
    { field: 'ingredientName', headerName: 'Ingredient', flex: 1 },
    { field: 'category',       headerName: 'Category', width: 130 },
    { field: 'totalQuantity',  headerName: 'Total Qty', width: 120, type: 'number' },
    { field: 'averageCost',    headerName: 'Avg Cost (₹)', width: 120, type: 'number' },
    { field: 'totalValue',     headerName: 'Total Value (₹)', width: 140, type: 'number' },
    { field: 'valuationMethod', headerName: 'Method', width: 110 },
  ]

  return (
    <DataGrid
      rows={data?.content ?? []}
      columns={columns}
      loading={isLoading}
      autoHeight
      sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
    />
  )
}
