// app/api/dashboard/stats/route.js
  import { getDashboardStats } from '@/lib/helpers/statsHelper'
  import { getCurrentUser } from '@/lib/auth'
  
  export async function GET(request) {
    try {
      const { searchParams } = new URL(request.url)
      const timeRange = searchParams.get('range') || '30d'
      
      const user = await getCurrentUser(request)
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const stats = await getDashboardStats(user, timeRange)
      
      return Response.json({
        success: true,
        data: stats,
        meta: {
          userRole: user.role,
          timeRange,
          generatedAt: new Date().toISOString()
        }
      })
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return Response.json(
        { error: 'Failed to fetch dashboard stats' }, 
        { status: 500 }
      )
    }
  }