import { Card, CardContent, CardHeader } from '@mui/material'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts'

const COLORS = ['#C62828','#E53935','#F44336','#EF9A9A','#FFCDD2']

interface Props {
  data: Array<{ category: string; value: number }>
}

export default function WasteAnalysisChart({ data }: Props) {
  return (
    <Card>
      <CardHeader title="Waste Analysis This Month" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              nameKey="category"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              formatter={(val: number) => [`₹${val.toFixed(2)}`, 'Value']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
