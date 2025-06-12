'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select,SelectValue, SelectTrigger, SelectContent, SelectItem } from './ui/select'
import { ToggleGroup, ToggleGroupItem } from '@radix-ui/react-toggle-group'
export default function DateRangeSelector({dateRange}) {
    const router = useRouter()
    const urlParams = useSearchParams()
    const newParams = new URLSearchParams(urlParams)
    const handleTimeRangeChange = (e) => {
        const selectedTimeRange = e.target.value
        newParams.set(
            'range' , selectedTimeRange
        )
        router.push(`?${newParams.toString()}`)
    }
  return (
    <div>
        <ToggleGroup
            type="single"
            value={dateRange}
            onValueChange={handleTimeRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
           <Select value={dateRange} onValueChange={handleTimeRangeChange}>
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
  )
}
