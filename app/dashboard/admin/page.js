import React from 'react'
import Property from '@/lib/models/Property'
import connectDB from '@/lib/db/connection' // or '@/lib/db'
import { SectionCards } from '@/components/section-cards'

export default async function SectionCard() {
  await connectDB()
  const stats = await Property.getLandlordStats('684545387f314561bcc39814')
console.log(stats)
  return (
    <div>
      <div className="text-lg font-semibold">SectionCard</div>
      <div className="text-sm text-muted-foreground">Total Revenue: ZMW {stats.total}</div>
      <p>{stats.occupied}</p>
      <SectionCards></SectionCards>
    </div>
  )
}
