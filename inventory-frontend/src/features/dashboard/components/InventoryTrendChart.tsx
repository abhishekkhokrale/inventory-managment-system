import { Card, CardContent, CardHeader } from '@mui/material'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'
import { InventoryTrend } from '@/types'
import dayjs from 'dayjs'

interface Props {
  data: InventoryTrend[]
}

export default function InventoryTrendChart({ data }: Props) {
  const formatted = data.map(d => ({
    ...d,
    date: dayjs(d.date).format('MMM DD'),
  }))

  return (
    <Card>
      <CardHeader title="Inventory Trends (Last 30 Days)" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="colorStockIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorStockOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1565C0" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C62828" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C62828" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            />
            <Legend />
            <Area type="monotone" dataKey="stockIn"  stroke="#2E7D32" fill="url(#colorStockIn)"  name="Stock In" />
            <Area type="monotone" dataKey="stockOut" stroke="#1565C0" fill="url(#colorStockOut)" name="Stock Out" />
            <Area type="monotone" dataKey="waste"    stroke="#C62828" fill="url(#colorWaste)"    name="Waste" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
