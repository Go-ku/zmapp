import React from 'react'
import Property from '@/lib/models/Property'
import connectDB from '@/lib/db/connection' // or '@/lib/db'
import SectionCards from '@/components/stat-cards'
import DateRangeSelector from '@/components/date-range-selector'
import { getSystemAdminSectionStats } from '@/lib/queries/sectionCardQueries'

export default async function SectionCard({searchParams}) {
await connectDB()
//   const stats = await Property.getLandlordStats('684545387f314561bcc39814')
// console.log(stats)
const selectedRange = await searchParams
const timeRange = selectedRange.range || '30d'
// fetch data eith range
const systemStats = getSystemAdminSectionStats(timeRange)
  return (
    <div>
      {/* <div className="text-lg font-semibold">SectionCard</div>
      <div className="text-sm text-muted-foreground">Total Revenue: ZMW {stats.total}</div>
      <p>{stats.occupied}</p> */}
      <DateRangeSelector dateRange={selectedRange}/>
      <SectionCards stats={systemStats}></SectionCards>
    </div>
  )
}
