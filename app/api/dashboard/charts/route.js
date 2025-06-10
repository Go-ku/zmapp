import { getCurrentUser } from '@/lib/auth'
import connectDB from '@/lib/db/connection'
import { getDashboardStats } from '@/lib/helpers/statsHelper'
import User from '@/lib/models/User'
import { getHistoricalChartDataFromDB } from '@/lib/queries/chartQueries'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const chartType = searchParams.get('type') || 'revenue'
    const timeRange = searchParams.get('range') || '30d'
    
    // Get authenticated user
    const user = await getCurrentUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  
    

    // Calculate date range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    // Fetch historical data from database
    const chartData = await getHistoricalChartDataFromDB(
      user.role, 
      user.id, 
      chartType, 
      startDate, 
      endDate
    )

    return Response.json({
      success: true,
      data: chartData,
      meta: {
        userRole: user.role,
        chartType,
        timeRange,
        recordCount: chartData.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return Response.json(
      { error: 'Failed to fetch chart data' }, 
      { status: 500 }
    )
  }
}