import { Card, CardContent, CardHeader } from '@mui/material'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from 'recharts'
import { TopConsumedIngredient } from '@/types'

const COLORS = ['#2E7D32','#388E3C','#43A047','#4CAF50','#66BB6A','#81C784','#A5D6A7','#C8E6C9','#E8F5E9','#F1F8E9']

interface Props {
  data: TopConsumedIngredient[]
}

export default function TopConsumedChart({ data }: Props) {
  return (
    <Card>
      <CardHeader title="Top 10 Consumed Ingredients" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="ingredientName" type="category" tick={{ fontSize: 11 }} width={75} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              formatter={(val: number) => [val.toFixed(2), 'Quantity']}
            />
            <Bar dataKey="totalQuantity" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
