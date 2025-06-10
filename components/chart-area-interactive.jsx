"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Bar, BarChart } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Real Estate Chart Configurations by User Role
const getChartConfig = (userRole, chartType) => {
  const configs = {
    systemAdmin: {
      revenue: {
        title: "System Revenue",
        description: "Total platform revenue over time",
        dataKeys: ["totalRevenue", "occupancyRevenue"],
        colors: {
          totalRevenue: "hsl(var(--primary))",
          occupancyRevenue: "hsl(var(--secondary))"
        },
        formatValue: (value) => `K${(value / 1000).toFixed(0)}`,
        yAxisLabel: "Revenue (ZMW)"
      },
      properties: {
        title: "Property Analytics",
        description: "Property distribution and occupancy trends",
        dataKeys: ["totalProperties", "occupiedProperties"],
        colors: {
          totalProperties: "hsl(var(--primary))",
          occupiedProperties: "hsl(var(--accent))"
        },
        formatValue: (value) => value.toString(),
        yAxisLabel: "Properties"
      },
      users: {
        title: "User Growth",
        description: "Platform user registration trends",
        dataKeys: ["landlords", "tenants"],
        colors: {
          landlords: "hsl(var(--primary))",
          tenants: "hsl(var(--secondary))"
        },
        formatValue: (value) => value.toString(),
        yAxisLabel: "Users"
      }
    },
    landlord: {
      revenue: {
        title: "Portfolio Revenue",
        description: "Monthly rental income and trends",
        dataKeys: ["monthlyRevenue", "projectedRevenue"],
        colors: {
          monthlyRevenue: "hsl(var(--primary))",
          projectedRevenue: "hsl(var(--muted))"
        },
        formatValue: (value) => `K${(value / 1000).toFixed(1)}`,
        yAxisLabel: "Revenue (ZMW)"
      },
      occupancy: {
        title: "Occupancy Rate",
        description: "Property occupancy percentage over time",
        dataKeys: ["occupancyRate"],
        colors: {
          occupancyRate: "hsl(var(--primary))"
        },
        formatValue: (value) => `${value}%`,
        yAxisLabel: "Occupancy %"
      },
      properties: {
        title: "Property Performance",
        description: "Individual property rental performance",
        dataKeys: ["occupied", "vacant", "maintenance"],
        colors: {
          occupied: "hsl(var(--primary))",
          vacant: "hsl(var(--secondary))",
          maintenance: "hsl(var(--destructive))"
        },
        formatValue: (value) => value.toString(),
        yAxisLabel: "Properties"
      }
    },
    tenant: {
      payments: {
        title: "Payment History",
        description: "Your rent payment timeline",
        dataKeys: ["amountPaid"],
        colors: {
          amountPaid: "hsl(var(--primary))"
        },
        formatValue: (value) => `K${(value / 1000).toFixed(1)}`,
        yAxisLabel: "Amount (ZMW)"
      },
      balance: {
        title: "Account Balance",
        description: "Outstanding balance over time",
        dataKeys: ["outstandingBalance"],
        colors: {
          outstandingBalance: "hsl(var(--destructive))"
        },
        formatValue: (value) => `K${(value / 1000).toFixed(1)}`,
        yAxisLabel: "Balance (ZMW)"
      }
    },
    admin: {
      performance: {
        title: "Task Performance",
        description: "Daily task completion metrics",
        dataKeys: ["tasksCompleted", "paymentsProcessed"],
        colors: {
          tasksCompleted: "hsl(var(--primary))",
          paymentsProcessed: "hsl(var(--secondary))"
        },
        formatValue: (value) => value.toString(),
        yAxisLabel: "Tasks"
      },
      approvals: {
        title: "Approval Metrics",
        description: "Payment approvals processed over time",
        dataKeys: ["approved", "rejected"],
        colors: {
          approved: "hsl(var(--primary))",
          rejected: "hsl(var(--destructive))"
        },
        formatValue: (value) => value.toString(),
        yAxisLabel: "Approvals"
      }
    }
  }

  return configs[userRole]?.[chartType] || configs.systemAdmin.revenue
}

// // Sample data generator for different chart types
// const generateSampleData = (chartType, userRole, days = 30) => {
//   const data = []
//   const today = new Date()
  
//   for (let i = days - 1; i >= 0; i--) {
//     const date = new Date(today)
//     date.setDate(date.getDate() - i)
//     const dateStr = date.toISOString().split('T')[0]
    
//     let dayData = { date: dateStr }
    
//     switch (userRole) {
//       case 'systemAdmin':
//         if (chartType === 'revenue') {
//           dayData.totalRevenue = 450000 + Math.random() * 100000
//           dayData.occupancyRevenue = 380000 + Math.random() * 80000
//         } else if (chartType === 'properties') {
//           dayData.totalProperties = 245 + Math.floor(Math.random() * 10)
//           dayData.occupiedProperties = 198 + Math.floor(Math.random() * 15)
//         } else if (chartType === 'users') {
//           dayData.landlords = 42 + Math.floor(Math.random() * 5)
//           dayData.tenants = 180 + Math.floor(Math.random() * 20)
//         }
//         break
        
//       case 'landlord':
//         if (chartType === 'revenue') {
//           dayData.monthlyRevenue = 18500 + Math.random() * 5000
//           dayData.projectedRevenue = 20000 + Math.random() * 3000
//         } else if (chartType === 'occupancy') {
//           dayData.occupancyRate = 85 + Math.random() * 10
//         } else if (chartType === 'properties') {
//           dayData.occupied = 6 + Math.floor(Math.random() * 2)
//           dayData.vacant = 2 + Math.floor(Math.random() * 2)
//           dayData.maintenance = Math.floor(Math.random() * 2)
//         }
//         break
        
//       case 'tenant':
//         if (chartType === 'payments') {
//           dayData.amountPaid = i % 30 === 0 ? 2500 : 0 // Monthly payments
//         } else if (chartType === 'balance') {
//           dayData.outstandingBalance = Math.max(0, Math.random() * 1000)
//         }
//         break
        
//       case 'admin':
//         if (chartType === 'performance') {
//           dayData.tasksCompleted = 8 + Math.floor(Math.random() * 15)
//           dayData.paymentsProcessed = 5 + Math.floor(Math.random() * 10)
//         } else if (chartType === 'approvals') {
//           dayData.approved = 3 + Math.floor(Math.random() * 8)
//           dayData.rejected = Math.floor(Math.random() * 3)
//         }
//         break
//     }
    
//     data.push(dayData)
//   }
  
//   return data
// }

// Main Chart Component
export function RealEstateChart({ 
  userRole = 'systemAdmin', 
  chartType = 'revenue', 
  data = null,
  className = "",
  showTimeRange = true,
  defaultTimeRange = "30d"
}) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState(defaultTimeRange)
  const [chartData, setChartData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  // Get chart configuration
  const config = getChartConfig(userRole, chartType)
  
  // Always use useEffect for data fetching
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        if (data) {
          // Use provided data
          setChartData(data)
          console.log('no smample data')
        } else {
          // Fetch real data from API
          const response = await fetch(`/api/dashboard/charts?type=${chartType}&range=${timeRange}`)
          
          if (!response.ok) {
            throw new Error('Failed to fetch chart data')
          }
          
          const result = await response.json()
          setChartData(result.data || [])
        }
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setError(err.message)
        
        // Fallback to sample data for demo purposes
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
        setChartData(generateSampleData(chartType, userRole, days))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [data, chartType, userRole, timeRange])

  // Always call useMemo for filtered data
  const filteredData = React.useMemo(() => {
    if (!chartData || !showTimeRange || data) return chartData || []
    
    const referenceDate = new Date()
    let daysToSubtract = 30
    if (timeRange === "90d") daysToSubtract = 90
    else if (timeRange === "7d") daysToSubtract = 7
    
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [chartData, timeRange, showTimeRange, data])

  // Always call useMemo for chart config
  const chartConfig = React.useMemo(() => {
    const configObj = {}
    config.dataKeys.forEach(key => {
      configObj[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        color: config.colors[key]
      }
    })
    return configObj
  }, [config])
  
  // Always call useEffect for mobile handling
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Show loading state
  if (loading) {
    return (
      <Card className={`@container/card ${className}`}>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (error && !chartData) {
    return (
      <Card className={`@container/card ${className}`}>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>Error loading chart data</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `K${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `K${(value / 1000).toFixed(0)}`
    }
    return `K${value}`
  }

  const formatValue = (value, key) => {
    if (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('balance')) {
      return formatCurrency(value)
    }
    if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percentage')) {
      return `${value.toFixed(1)}%`
    }
    return value.toString()
  }

  return (
    <Card className={`@container/card ${className}`}>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {config.description}
          </span>
          <span className="@[540px]/card:hidden">
            {config.description.split(' ').slice(0, 3).join(' ')}...
          </span>
        </CardDescription>
        {showTimeRange && (
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
              <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
              <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
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
        )}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              {config.dataKeys.map((key, index) => (
                <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={config.colors[key]} 
                    stopOpacity={index === 0 ? 0.8 : 0.6} 
                  />
                  <stop 
                    offset="95%" 
                    stopColor={config.colors[key]} 
                    stopOpacity={0.1} 
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => config.formatValue(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value, name) => [
                    formatValue(value, name),
                    chartConfig[name]?.label || name
                  ]}
                  indicator="dot"
                />
              }
            />
            {config.dataKeys.map((key, index) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#fill${key})`}
                stroke={config.colors[key]}
                strokeWidth={2}
                stackId={config.dataKeys.length > 1 ? "a" : undefined}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Multiple chart types for comprehensive dashboard
export function RealEstateChartsGrid({ userRole, statsData }) {
  const getChartsForRole = (role) => {
    switch (role) {
      case 'systemAdmin':
        return [
          { type: 'revenue', data: statsData?.revenue },
          { type: 'properties', data: statsData?.properties },
          { type: 'users', data: statsData?.users }
        ]
      case 'landlord':
        return [
          { type: 'revenue', data: statsData?.revenue },
          { type: 'occupancy', data: statsData?.occupancy },
          { type: 'properties', data: statsData?.properties }
        ]
      case 'tenant':
        return [
          { type: 'payments', data: statsData?.payments },
          { type: 'balance', data: statsData?.balance }
        ]
      case 'admin':
        return [
          { type: 'performance', data: statsData?.performance },
          { type: 'approvals', data: statsData?.approvals }
        ]
      default:
        return []
    }
  }

  const charts = getChartsForRole(userRole)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {charts.map((chart, index) => (
        <RealEstateChart
          key={`${userRole}-${chart.type}-${index}`}
          userRole={userRole}
          chartType={chart.type}
          data={chart.data}
          className="col-span-1"
        />
      ))}
    </div>
  )
}

// Hook for fetching chart data
export function useChartData(userRole, chartType, timeRange = '30d', useHistorical = false) {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams({
          type: chartType,
          range: timeRange,
          historical: useHistorical.toString()
        })
        
        const response = await fetch(`/api/dashboard/charts?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch chart data')
        }
        
        const result = await response.json()
        setData(result.data)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching chart data:', err)
        
        // Fallback to sample data
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
        setData(generateSampleData(chartType, userRole, days))
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [userRole, chartType, timeRange, useHistorical])

  return { data, loading, error }
}

// Simple chart component without complex data fetching
export function SimpleRealEstateChart({
  title = "Revenue Chart",
  description = "Monthly revenue data",
  data = [],
  dataKeys = ["revenue"],
  colors = { revenue: "hsl(var(--primary))" },
  timeRange = "30d",
  onTimeRangeChange = null,
  showTimeRange = true,
  className = ""
}) {
  const isMobile = useIsMobile()
  
  const chartConfig = React.useMemo(() => {
    const configObj = {}
    dataKeys.forEach(key => {
      configObj[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        color: colors[key] || "hsl(var(--primary))"
      }
    })
    return configObj
  }, [dataKeys, colors])

  const formatValue = (value, key) => {
    if (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('amount')) {
      if (value >= 1000000) return `K${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `K${(value / 1000).toFixed(0)}`
      return `K${value}`
    }
    if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percentage')) {
      return `${value.toFixed(1)}%`
    }
    return value.toString()
  }

  return (
    <Card className={`@container/card ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">{description}</span>
          <span className="@[540px]/card:hidden">
            {description.split(' ').slice(0, 3).join(' ')}...
          </span>
        </CardDescription>
        {showTimeRange && onTimeRangeChange && (
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={onTimeRangeChange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
              <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
              <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="flex w-40 @[767px]/card:hidden" size="sm">
                <SelectValue placeholder="Last 30 days" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[key]} stopOpacity={index === 0 ? 0.8 : 0.6} />
                  <stop offset="95%" stopColor={colors[key]} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatValue(value, dataKeys[0])}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value, name) => [
                    formatValue(value, name),
                    chartConfig[name]?.label || name
                  ]}
                  indicator="dot"
                />
              }
            />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#fill${key})`}
                stroke={colors[key]}
                strokeWidth={2}
                stackId={dataKeys.length > 1 ? "a" : undefined}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Example usage component that's safe from hooks issues
export function DashboardWithCharts({ userRole = 'systemAdmin' }) {
  const { data: revenueData, loading } = useChartData(userRole, 'revenue', '30d', true)

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <SimpleRealEstateChart
        title="Revenue Analytics"
        description="Monthly revenue trends"
        data={revenueData || []}
        dataKeys={["totalRevenue", "occupancyRevenue"]}
        colors={{
          totalRevenue: "hsl(var(--primary))",
          occupancyRevenue: "hsl(var(--secondary))"
        }}
      />
      
      <RealEstateChartsGrid 
        userRole={userRole} 
      />
    </div>
  )
}