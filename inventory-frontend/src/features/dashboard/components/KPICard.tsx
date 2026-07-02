import { Card, CardContent, Box, Typography, Skeleton, Avatar } from '@mui/material'
import { TrendingUp, TrendingDown, Warning } from '@mui/icons-material'
import React from 'react'

interface KPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  trend?: 'success' | 'warning' | 'danger'
  loading?: boolean
}

export default function KPICard({ title, value, icon, color, trend, loading }: KPICardProps) {
  const trendIcon = trend === 'warning'
    ? <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
    : trend === 'danger'
    ? <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
    : trend === 'success'
    ? <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
    : null

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={40} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {trendIcon && (
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                {trendIcon}
                <Typography variant="caption" color="text.secondary">
                  Needs attention
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, width: 52, height: 52 }}>
            <Box sx={{ color }}>{icon}</Box>
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}
