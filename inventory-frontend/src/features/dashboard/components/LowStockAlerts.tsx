import {
  Card, CardContent, CardHeader, List, ListItem, ListItemText,
  ListItemIcon, Chip, Typography, Box, Skeleton
} from '@mui/material'
import { Warning } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { ingredientsApi } from '@/api/ingredients.api'

export default function LowStockAlerts() {
  const { data, isLoading } = useQuery({
    queryKey: ['ingredients', 'low-stock'],
    queryFn: ingredientsApi.getLowStock,
  })

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Low Stock Alerts"
        action={
          data && (
            <Chip label={data.length} color="error" size="small" />
          )
        }
      />
      <CardContent sx={{ pt: 0 }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={56} sx={{ mb: 1 }} />
          ))
        ) : !data?.length ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">All stock levels are healthy</Typography>
          </Box>
        ) : (
          <List dense>
            {data.slice(0, 8).map(ingredient => (
              <ListItem key={ingredient.id} divider>
                <ListItemIcon>
                  <Warning color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={ingredient.name}
                  secondary={`Reorder at: ${ingredient.reorderLevel} ${ingredient.unitOfMeasure?.abbreviation}`}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: 14 }}
                  secondaryTypographyProps={{ fontSize: 12 }}
                />
                <Chip
                  label="Low"
                  color="warning"
                  size="small"
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}
