'use client'

import { useEffect, use } from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


const StatCard= ({stats,
    id, 
  title, 
  value, 
  trend, 
  trendType, 
  icon, 
  subtitle, 
  color = 'blue',
  onClick }) =>{
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
      

  )
}

export function SectionCards({userRole = 'system_admin', 
  timeRange = '30d',}) {
    const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

    const handleTimeRangeChange = (newRange) => {
    setSelectedTimeRange(newRange)
    
    if (error && stats.length === 0) {
        return (
          <div className={`grid grid-cols-1 gap-4 ${className}`}>
            <ErrorCard onRetry={refetch} />
          </div>
        )
      }
    
    return (
        <>
        <div>
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
        </div>
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {stats.map((card) => (
                <StatCard stats = {card} key={card.id}/>
            ))}
        </div>
        </>
    )
}}
