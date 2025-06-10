// scripts/test-chart-data.js
import connectDB from '../db/connection'
import { getDashboardStats } from '@/lib/helpers/statsHelper'
import { getHistoricalChartDataFromDB } from '@/lib/queries/chartQueries'

async function testChartData() {
  await connectDB()
  
  // Test user (replace with actual user ID from your database)
  const testUser = {
    id: 'your-landlord-id-here',
    role: 'landlord'
  }
  
  try {
    console.log('Testing dashboard stats...')
    const stats = await getDashboardStats(testUser, '30d')
    console.log('Stats:', JSON.stringify(stats, null, 2))
    
    console.log('Testing historical chart data...')
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    const chartData = await getHistoricalChartDataFromDB(
      testUser.role,
      testUser.id,
      'revenue',
      startDate,
      endDate
    )
    console.log('Chart Data:', JSON.stringify(chartData, null, 2))
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}