"use client"

import React, { useState, useEffect } from 'react'
import { 
  BuildingIcon,
  User2Icon,
   
  DollarSignIcon, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  ClockIcon, 
  BarChart3Icon, 
  WrenchIcon,
  ReceiptIcon, 
  ShieldCheckIcon,
  GroupIcon,
  HomeIcon,
  ActivityIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  LoaderIcon,
  RefreshCw,
  UsersIcon
} from 'lucide-react'
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import { Card, CardHeader, CardAction, CardFooter, CardContent, CardDescription, CardTitle } from './ui/card'
import { ToggleGroup, ToggleGroupItem} from './ui/toggle-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'

// Icon mapping for section cards
const iconMap = {
  'building': BuildingIcon,
  'users': UsersIcon,
  'user-group': GroupIcon,
  'currency': DollarSignIcon,
  'chart-bar': BarChart3Icon,
  'clock': ClockIcon,
  'trending-up': TrendingUpIcon,
  'tool': WrenchIcon,
  'receipt': ReceiptIcon,
  'shield-check': ShieldCheckIcon,
  'home': HomeIcon,
  'activity': ActivityIcon
}

// Color mapping for cards
const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    trend: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    trend: 'text-green-600',
    border: 'border-green-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    trend: 'text-purple-600',
    border: 'border-purple-200'
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    trend: 'text-emerald-600',
    border: 'border-emerald-200'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    trend: 'text-indigo-600',
    border: 'border-indigo-200'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    trend: 'text-orange-600',
    border: 'border-orange-200'
  },
  cyan: {
    bg: 'bg-cyan-50',
    icon: 'text-cyan-600',
    trend: 'text-cyan-600',
    border: 'border-cyan-200'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    trend: 'text-red-600',
    border: 'border-red-200'
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'text-teal-600',
    trend: 'text-teal-600',
    border: 'border-teal-200'
  },
  lime: {
    bg: 'bg-lime-50',
    icon: 'text-lime-600',
    trend: 'text-lime-600',
    border: 'border-lime-200'
  }
}

// Individual stat card component
const StatCard = ({ 
  id, 
  title, 
  value, 
  trend, 
  trendType, 
  icon, 
  subtitle, 
  color = 'blue',
  onClick 
}) => {
  const IconComponent = iconMap[icon] || BuildingIcon
  const colors = colorMap[color] || colorMap.blue
  
  // Format trend display
  const formatTrend = (trend, trendType) => {
    if (trend === 0 || trend === null || trend === undefined) {
      return { display: '0%', color: 'text-gray-500' }
    }
    
    const sign = trend > 0 ? '+' : ''
    const display = `${sign}${trend}%`
    
    if (trendType === 'positive') {
      return { display, color: 'text-green-600' }
    } else if (trendType === 'negative') {
      return { display, color: 'text-red-600' }
    } else {
      return { display, color: 'text-gray-500' }
    }
  }
  
  const trendData = formatTrend(trend, trendType)
  const TrendIcon = trendType === 'positive' ? IconTrendingUp : 
                   trendType === 'negative' ? IconTrendingDown : ActivityIcon
  const trendDescription = trendType === 'positive' ? ' Trending up' : trendType === 'negative' ? 'Trending down' : 'Activity'

  return (
    
      <div onClick={onClick} className="*:data-[slot=card]:from-primary/5 transition-all duration-200  group *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
          <CardAction>
            {trend !== 0 && (
              <Badge variant="outline">
              <TrendIcon />
              {trendData.display}
            </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            ${`${trendDescription} this month`} <TrendIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {subtitle}
          </div>
        </CardFooter>
      </Card>
      {/* <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
              <IconComponent className={`h-6 w-6 ${colors.icon}`} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {trend !== 0 && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${trendData.color}`}>
                    <TrendIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                    {trendData.display}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-600">
            {subtitle}
          </div>
        </div>
      </div> */}
    </div>
  )
}

// Loading skeleton component
const StatCardSkeleton = () => (
  <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse"></div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
      </div>
    </div>
  </div>
)

// Error card component
const ErrorCard = ({ onRetry }) => (
  <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-red-200 col-span-full">
    <div className="p-5 text-center">
      <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Failed to load dashboard statistics
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        There was an error loading the dashboard data. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </button>
    </div>
  </div>
)

// Custom hook for fetching section stats
const useSectionStats = (timeRange = '30d', userRole = 'system_admin') => {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/dashboard/section-stats?range=${timeRange}&role=${userRole}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && Array.isArray(result.data)) {
        setStats(result.data)
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      console.error('Error fetching section stats:', err)
      setError(err.message)
      // Set default cards as fallback
      setStats(getDefaultCards())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [timeRange, userRole])

  return { stats, loading, error, refetch: fetchStats }
}

// Default cards for fallback
const getDefaultCards = () => [
  {
    id: 'total-properties',
    title: 'Total Properties',
    value: '0',
    trend: 0,
    trendType: 'neutral',
    icon: 'building',
    subtitle: 'Loading...',
    color: 'blue'
  },
  {
    id: 'total-users',
    title: 'Total Users',
    value: '0',
    trend: 0,
    trendType: 'neutral',
    icon: 'users',
    subtitle: 'Loading...',
    color: 'green'
  },
  {
    id: 'total-revenue',
    title: 'Total Revenue',
    value: 'K0',
    trend: 0,
    trendType: 'neutral',
    icon: 'currency',
    subtitle: 'Loading...',
    color: 'emerald'
  },
  {
    id: 'system-health',
    title: 'System Health',
    value: '0%',
    trend: 0,
    trendType: 'neutral',
    icon: 'shield-check',
    subtitle: 'Loading...',
    color: 'lime'
  }
]

// Main SectionCards component
export function SectionCards({ 
  userRole = 'system_admin', 
  timeRange = '30d', 
  onCardClick = null,
  className = '' 
}) {
  const { stats, loading, error, refetch } = useSectionStats(timeRange, userRole)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

  // Handle time range change
  const handleTimeRangeChange = (newRange) => {
    setSelectedTimeRange(newRange)
    // This will trigger useEffect in useSectionStats
  }

  // Handle card click
  const handleCardClick = (card) => {
    if (onCardClick) {
      onCardClick(card)
    } else {
      console.log('Card clicked:', card.title, card.value)
    }
  }

  // Show error state
  if (error && stats.length === 0) {
    return (
      <div className={`grid grid-cols-1 gap-4 ${className}`}>
        <ErrorCard onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header with time range selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-600">
            Key metrics and statistics for {userRole.replace('_', ' ')}
          </p>
        </div>
        
        <div className="">
          <CardAction>
            <ToggleGroup
            type="single"
            value={selectedTimeRange}
            onValueChange={(e) => handleTimeRangeChange(e.target.value)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
           <Select value={selectedTimeRange} onValueChange={(e) => handleTimeRangeChange(e.target.value)}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
          </CardAction>
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <select
            value={selectedTimeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
          </select>
          
          <button
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="">
        {loading ? (
          // Show loading skeletons
          Array.from({ length: 8 }, (_, i) => (
            <StatCardSkeleton key={i} />
          ))
        ) : (
          // Show actual stats
          stats.map((card) => (
            <StatCard
              key={card.id}
              {...card}
              onClick={() => handleCardClick(card)}
            />
          ))
        )}
      </div>
      
      {/* Success indicator */}
      {!loading && !error && stats.length > 0 && (
        <div className="mt-4 flex items-center text-sm text-green-600">
          <CheckCircleIcon className="h-4 w-4 mr-2" />
          Dashboard updated successfully
        </div>
      )}
    </div>
  )
}

// Role-based section cards wrapper
export function RoleBasedSectionCards({ userRole, timeRange = '30d' }) {
  const handleCardClick = (card) => {
    // Navigate to detailed view based on card type
    switch (card.id) {
      case 'total-properties':
        // Navigate to properties page
        console.log('Navigate to properties')
        break
      case 'total-revenue':
        // Navigate to revenue analytics
        console.log('Navigate to revenue')
        break
      case 'pending-approvals':
        // Navigate to approvals page
        console.log('Navigate to approvals')
        break
      default:
        console.log('Default card action for:', card.title)
    }
  }

  return (
    <SectionCards 
      userRole={userRole} 
      timeRange={timeRange}
      onCardClick={handleCardClick}
      className="mb-8"
    />
  )
}

// Export individual components for flexibility
export { StatCard, StatCardSkeleton, ErrorCard, useSectionStats }

// Usage examples in comments:
/*
// Basic usage:
<SectionCards userRole="system_admin" timeRange="30d" />

// With custom card click handler:
<SectionCards 
  userRole="system_admin" 
  onCardClick={(card) => {
    router.push(`/dashboard/${card.id}`)
  }}
/>

// Role-based with navigation:
<RoleBasedSectionCards userRole="system_admin" timeRange="7d" />

// Custom styling:
<SectionCards 
  userRole="landlord" 
  className="my-8 px-4"
/>
*/