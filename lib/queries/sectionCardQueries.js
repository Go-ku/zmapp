import mongoose from 'mongoose'
import Property from '../models/Property'
import Payment from '../models/Payment'
// import { User } from '@/models/User'
// import { Tenant } from '@/models/Tenant'
// import { Lease } from '@/models/Lease'
// import { MaintenanceRequest } from '@/models/MaintenanceRequest'

/**
 * Comprehensive queries for System Admin dashboard section cards
 * Returns all key metrics and statistics for overview cards
 */

// === MAIN FUNCTION: Get all section card stats ===
export const getSystemAdminSectionStats = async (timeRange = '30d') => {
  try {
    console.log('=== Getting System Admin Section Stats ===')
    
    // Calculate date ranges for comparisons
    const now = new Date()
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    
    const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(now.getTime() - (days * 2) * 24 * 60 * 60 * 1000)
    const previousPeriodEnd = currentPeriodStart
    
    console.log('Date ranges:')
    console.log('Current period:', currentPeriodStart, 'to', now)
    console.log('Previous period:', previousPeriodStart, 'to', previousPeriodEnd)
    
    // Get all stats in parallel for better performance
    const [
    //   propertyStats,
    //   userStats,
      revenueStats,
    //   paymentStats,
    //   occupancyStats,
    //   maintenanceStats,
    //   activityStats,
    //   growthStats
    ] = await Promise.all([
    //   getPropertyStats(currentPeriodStart, previousPeriodStart, previousPeriodEnd),
    //   getUserStats(currentPeriodStart, previousPeriodStart, previousPeriodEnd),
      getRevenueStats(currentPeriodStart, previousPeriodStart, previousPeriodEnd),
    //   getPaymentStats(currentPeriodStart),
    //   getOccupancyStats(),
    //   getMaintenanceStats(currentPeriodStart),
    //   getActivityStats(currentPeriodStart),
    //   getGrowthStats(currentPeriodStart, previousPeriodStart, previousPeriodEnd)
    ])
    
    // Combine all stats into section card format
    const sectionCards = [
    //   {
    //     id: 'total-properties',
    //     title: 'Total Properties',
    //     value: propertyStats.total,
    //     trend: propertyStats.growth,
    //     trendType: propertyStats.growth >= 0 ? 'positive' : 'negative',
    //     icon: 'building',
    //     subtitle: `${propertyStats.newThisPeriod} added this ${timeRange.replace('d', ' days')}`,
    //     color: 'blue'
    //   },
    //   {
    //     id: 'total-landlords',
    //     title: 'Active Landlords',
    //     value: userStats.landlords,
    //     trend: userStats.landlordGrowth,
    //     trendType: userStats.landlordGrowth >= 0 ? 'positive' : 'negative',
    //     icon: 'users',
    //     subtitle: `${userStats.newLandlords} new registrations`,
    //     color: 'green'
    //   },
    //   {
    //     id: 'total-tenants',
    //     title: 'Active Tenants',
    //     value: userStats.tenants,
    //     trend: userStats.tenantGrowth,
    //     trendType: userStats.tenantGrowth >= 0 ? 'positive' : 'negative',
    //     icon: 'user-group',
    //     subtitle: `${userStats.newTenants} new this period`,
    //     color: 'purple'
    //   },
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: `K${(revenueStats.total / 1000).toFixed(0)}`,
        trend: revenueStats.growth,
        trendType: revenueStats.growth >= 0 ? 'positive' : 'negative',
        icon: 'currency',
        subtitle: `K${(revenueStats.currentPeriod / 1000).toFixed(0)} this ${timeRange.replace('d', ' days')}`,
        color: 'emerald'
      },
    //   {
    //     id: 'occupancy-rate',
    //     title: 'Occupancy Rate',
    //     value: `${occupancyStats.rate}%`,
    //     trend: occupancyStats.trend,
    //     trendType: occupancyStats.trend >= 0 ? 'positive' : 'negative',
    //     icon: 'chart-bar',
    //     subtitle: `${occupancyStats.occupied} of ${occupancyStats.total} units`,
    //     color: 'indigo'
    //   },
    //   {
    //     id: 'pending-approvals',
    //     title: 'Pending Approvals',
    //     value: paymentStats.pendingApprovals,
    //     trend: paymentStats.approvalTrend,
    //     trendType: paymentStats.approvalTrend <= 0 ? 'positive' : 'negative', // Lower is better
    //     icon: 'clock',
    //     subtitle: `K${(paymentStats.pendingAmount / 1000).toFixed(0)} total value`,
    //     color: 'orange'
    //   },
    //   {
    //     id: 'monthly-revenue',
    //     title: 'Monthly Revenue',
    //     value: `K${(revenueStats.monthly / 1000).toFixed(0)}`,
    //     trend: revenueStats.monthlyGrowth,
    //     trendType: revenueStats.monthlyGrowth >= 0 ? 'positive' : 'negative',
    //     icon: 'trending-up',
    //     subtitle: 'This month vs last month',
    //     color: 'cyan'
    //   },
    //   {
    //     id: 'maintenance-requests',
    //     title: 'Open Maintenance',
    //     value: maintenanceStats.open,
    //     trend: maintenanceStats.trend,
    //     trendType: maintenanceStats.trend <= 0 ? 'positive' : 'negative', // Lower is better
    //     icon: 'tool',
    //     subtitle: `${maintenanceStats.urgent} urgent requests`,
    //     color: 'red'
    //   },
    //   {
    //     id: 'collection-rate',
    //     title: 'Collection Rate',
    //     value: `${paymentStats.collectionRate}%`,
    //     trend: paymentStats.collectionTrend,
    //     trendType: paymentStats.collectionTrend >= 0 ? 'positive' : 'negative',
    //     icon: 'receipt',
    //     subtitle: 'Payment collection efficiency',
    //     color: 'teal'
    //   },
    //   {
    //     id: 'system-health',
    //     title: 'System Health',
    //     value: `${activityStats.healthScore}%`,
    //     trend: activityStats.healthTrend,
    //     trendType: activityStats.healthTrend >= 0 ? 'positive' : 'negative',
    //     icon: 'shield-check',
    //     subtitle: 'Overall system performance',
    //     color: 'lime'
    //   }
    ]
    
    console.log('Section cards generated:', sectionCards.length)
    return sectionCards
    
  } catch (error) {
    console.error('Error getting system admin section stats:', error)
    return getDefaultSectionCards()
  }
}

const getRevenueStats = async (currentStart, previousStart, previousEnd) => {
  try {
    const stats = await Payment.aggregate([
      {
        $facet: {
          total: [
            {
              $match: { status: 'APPROVED' }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" }
              }
            }
          ],
          currentPeriod: [
            {
              $match: {
                status: 'APPROVED',
                createdAt: { $gte: currentStart }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" }
              }
            }
          ],
          previousPeriod: [
            {
              $match: {
                status: 'APPROVED',
                createdAt: { 
                  $gte: previousStart, 
                  $lt: previousEnd 
                }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" }
              }
            }
          ],
          thisMonth: [
            {
              $match: {
                status: 'APPROVED',
                createdAt: { 
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
                }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" }
              }
            }
          ],
          lastMonth: [
            {
              $match: {
                status: 'APPROVED',
                createdAt: { 
                  $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                  $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" }
              }
            }
          ]
        }
      }
    ])
    
    const result = stats[0]
    const total = result.total[0]?.total || 0
    const currentPeriod = result.currentPeriod[0]?.total || 0
    const previousPeriod = result.previousPeriod[0]?.total || 0
    const thisMonth = result.thisMonth[0]?.total || 0
    const lastMonth = result.lastMonth[0]?.total || 0
    
    const growth = previousPeriod > 0 
      ? ((currentPeriod - previousPeriod) / previousPeriod * 100).toFixed(1)
      : currentPeriod > 0 ? 100 : 0
      
    const monthlyGrowth = lastMonth > 0 
      ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1)
      : thisMonth > 0 ? 100 : 0
    
    return {
      total,
      currentPeriod,
      monthly: thisMonth,
      growth: parseFloat(growth),
      monthlyGrowth: parseFloat(monthlyGrowth)
    }
  } catch (error) {
    console.error('Error getting revenue stats:', error)
    return {
      total: 0,
      currentPeriod: 0,
      monthly: 0,
      growth: 0,
      monthlyGrowth: 0
    }
  }
}
