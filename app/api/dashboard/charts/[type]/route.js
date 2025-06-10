// app/api/dashboard/charts/[type]/route.js
  import { getDashboardStats } from '@/lib/helpers/statsHelper'
  import { transformStatsToChartData } from '@/lib/transformers/chartDataTransformer'
  import { getCurrentUser } from '@/lib/auth'
  
  export async function GET(request, { params }) {
    try {
      const chartType = params.type
      const { searchParams } = new URL(request.url)
      const timeRange = searchParams.get('range') || '30d'
      
      const user = await getCurrentUser(request)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const stats = await getDashboardStats(user, timeRange)
      const chartData = transformStatsToChartData(stats, user.role, chartType, timeRange)
      
      return Response.json({
        success: true,
        data: chartData,
        chartType,
        timeRange
      })
      
    } catch (error) {
      console.error(`Error fetching ${params.type} chart data:`, error)
      return Response.json(
        { error: 'Failed to fetch chart data' }, 
        { status: 500 }
      )
    }
  }