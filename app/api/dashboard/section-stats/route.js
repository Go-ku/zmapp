// app/api/dashboard/section-stats/route.js

import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connection'
import { getCurrentUser } from '@/lib/auth' // Your auth utility
import { getSystemAdminSectionStats } from '@/lib/queries/sectionCardQueries'
import { getPaymentStatsWithCache, diagnoseFinalPaymentPerformance } from '@/lib/queries/optimizedPaymentQueries'
import User from '@/lib/models/User'
import Property from '@/lib/models/Property'
import Payment from '@/lib/models/Payment'
import Lease from '@/lib/models/Lease'
// Cache for stats to improve performance
let statsCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Helper function to generate cache key
const getCacheKey = (userRole, userId, timeRange) => {
  return `stats_${userRole}_${userId || 'all'}_${timeRange}`
}

// Helper function to get time range dates
const getTimeRangeDates = (timeRange) => {
  const now = new Date()
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
  
  return {
    start: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
    end: now,
    days
  }
}

// Role-based stats functions
const getRoleSpecificStats = async (user, timeRange) => {
  const { start } = getTimeRangeDates(timeRange)
  
  switch (user.role) {
    case 'SYSTEM_ADMIN':
    case 'system_admin':
      return await getSystemAdminSectionStats(timeRange)
      
    case 'LANDLORD':
    case 'landlord':
      return await getLandlordSectionStats(user.id, timeRange)
      
    case 'TENANT':
    case 'tenant':
      return await getTenantSectionStats(user.id, timeRange)
      
    case 'ADMIN':
    case 'admin':
      return await getAdminSectionStats(user.id, timeRange)
      
    default:
      throw new Error(`Unknown user role: ${user.role}`)
  }
}

// Landlord specific stats
const getLandlordSectionStats = async (landlordId, timeRange = '30d') => {
  try {
       
    const { start } = getTimeRangeDates(timeRange)
    
    // Get landlord's properties and related stats
    const [
      propertyCount,
      tenantCount,
      monthlyRevenue,
      occupancyData,
      pendingPayments
    ] = await Promise.all([
      Property.countDocuments({ landlordId }).maxTimeMS(5000),
      User.countDocuments({ landlordId, role: { $in: ['TENANT', 'tenant'] } }).maxTimeMS(5000),
      
      Payment.aggregate([
        {
          $lookup: {
            from: 'properties',
            localField: 'propertyId', 
            foreignField: '_id',
            as: 'property'
          }
        },
        {
          $match: {
            'property.landlordId': landlordId,
            status: 'APPROVED',
            createdAt: { $gte: start }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]).maxTimeMS(5000),
      
      Property.aggregate([
        { $match: { landlordId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            occupied: {
              $sum: {
                $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0]
              }
            }
          }
        }
      ]).maxTimeMS(5000),
      
      Payment.aggregate([
        {
          $lookup: {
            from: 'properties',
            localField: 'propertyId',
            foreignField: '_id', 
            as: 'property'
          }
        },
        {
          $match: {
            'property.landlordId': landlordId,
            status: 'PENDING_APPROVAL'
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: { $sum: '$amount' }
          }
        }
      ]).maxTimeMS(5000)
    ])
    
    const revenue = monthlyRevenue[0]?.total || 0
    const occupancy = occupancyData[0] || { total: 0, occupied: 0 }
    const pending = pendingPayments[0] || { count: 0, amount: 0 }
    const occupancyRate = occupancy.total > 0 ? (occupancy.occupied / occupancy.total * 100).toFixed(1) : 0
    
    return [
      {
        id: 'my-properties',
        title: 'My Properties',
        value: propertyCount,
        trend: 0,
        trendType: 'neutral',
        icon: 'building',
        subtitle: `${occupancy.occupied} occupied`,
        color: 'blue'
      },
      {
        id: 'my-tenants',
        title: 'My Tenants', 
        value: tenantCount,
        trend: 0,
        trendType: 'neutral',
        icon: 'users',
        subtitle: 'Active tenants',
        color: 'green'
      },
      {
        id: 'monthly-revenue',
        title: 'Monthly Revenue',
        value: `K${(revenue / 1000).toFixed(0)}`,
        trend: 0,
        trendType: 'neutral',
        icon: 'currency',
        subtitle: `This ${timeRange.replace('d', ' days')}`,
        color: 'emerald'
      },
      {
        id: 'occupancy-rate',
        title: 'Occupancy Rate',
        value: `${occupancyRate}%`,
        trend: 0,
        trendType: 'neutral',
        icon: 'chart-bar',
        subtitle: `${occupancy.occupied}/${occupancy.total} units`,
        color: 'indigo'
      },
      {
        id: 'pending-payments',
        title: 'Pending Payments',
        value: pending.count,
        trend: 0,
        trendType: 'neutral',
        icon: 'clock',
        subtitle: `K${(pending.amount / 1000).toFixed(0)} total`,
        color: 'orange'
      }
    ]
    
  } catch (error) {
    console.error('Error getting landlord stats:', error)
    return getLandlordDefaultStats()
  }
}

// Tenant specific stats
const getTenantSectionStats = async (tenantId, timeRange = '30d') => {
  try {

    
    const { start } = getTimeRangeDates(timeRange)
    
    const [
      currentLease,
      paymentHistory,
      accountBalance,
      nextPayment
    ] = await Promise.all([
      Lease.findOne({ tenantId, status: 'ACTIVE' }).maxTimeMS(5000),
      
      Payment.aggregate([
        {
          $match: {
            tenantId,
            status: 'APPROVED',
            createdAt: { $gte: start }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]).maxTimeMS(5000),
      
      Payment.aggregate([
        { $match: { tenantId } },
        {
          $group: {
            _id: null,
            paid: {
              $sum: {
                $cond: [{ $eq: ['$status', 'APPROVED'] }, '$amount', 0]
              }
            },
            owed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'PENDING_APPROVAL'] }, '$amount', 0]
              }
            }
          }
        }
      ]).maxTimeMS(5000),
      
      Payment.findOne({
        tenantId,
        status: 'PENDING_APPROVAL'
      }).sort({ dueDate: 1 }).maxTimeMS(5000)
    ])
    
    const payments = paymentHistory[0] || { total: 0, count: 0 }
    const balance = accountBalance[0] || { paid: 0, owed: 0 }
    const currentRent = currentLease?.monthlyRent || 0
    const nextDue = nextPayment?.dueDate || null
    const outstandingBalance = balance.owed - balance.paid
    
    return [
      {
        id: 'current-rent',
        title: 'Monthly Rent',
        value: `K${(currentRent / 1000).toFixed(1)}`,
        trend: 0,
        trendType: 'neutral',
        icon: 'home',
        subtitle: 'Current rent amount',
        color: 'blue'
      },
      {
        id: 'payments-made',
        title: 'Payments Made',
        value: payments.count,
        trend: 0,
        trendType: 'positive',
        icon: 'receipt',
        subtitle: `K${(payments.total / 1000).toFixed(0)} total`,
        color: 'green'
      },
      {
        id: 'account-balance',
        title: 'Account Balance',
        value: `K${Math.abs(outstandingBalance / 1000).toFixed(0)}`,
        trend: 0,
        trendType: outstandingBalance <= 0 ? 'positive' : 'negative',
        icon: 'currency',
        subtitle: outstandingBalance <= 0 ? 'Paid up' : 'Outstanding',
        color: outstandingBalance <= 0 ? 'emerald' : 'red'
      },
      {
        id: 'next-payment',
        title: 'Next Payment',
        value: nextDue ? new Date(nextDue).toLocaleDateString() : 'None',
        trend: 0,
        trendType: 'neutral',
        icon: 'calendar',
        subtitle: nextDue ? `K${(currentRent / 1000).toFixed(0)} due` : 'All paid',
        color: 'purple'
      }
    ]
    
  } catch (error) {
    console.error('Error getting tenant stats:', error)
    return getTenantDefaultStats()
  }
}

// Admin specific stats
const getAdminSectionStats = async (adminId, timeRange = '30d') => {
  try {

    
    const { start } = getTimeRangeDates(timeRange)
    
    const [
      assignedProperties,
      managedTenants,
      paymentsProcessed,
      pendingApprovals,
      receiptsIssued
    ] = await Promise.all([
      Property.countDocuments({ assignedAdminId: adminId }).maxTimeMS(5000),
      User.countDocuments({ assignedAdminId: adminId, role: { $in: ['TENANT', 'tenant'] } }).maxTimeMS(5000),
      Payment.countDocuments({ processedBy: adminId, createdAt: { $gte: start } }).maxTimeMS(5000),
      Payment.countDocuments({ status: 'PENDING_APPROVAL', assignedTo: adminId }).maxTimeMS(5000),
      Payment.countDocuments({ processedBy: adminId, status: 'APPROVED', createdAt: { $gte: start } }).maxTimeMS(5000)
    ])
    
    return [
      {
        id: 'assigned-properties',
        title: 'Assigned Properties',
        value: assignedProperties,
        trend: 0,
        trendType: 'neutral',
        icon: 'building',
        subtitle: 'Properties to manage',
        color: 'blue'
      },
      {
        id: 'managed-tenants',
        title: 'Managed Tenants',
        value: managedTenants,
        trend: 0,
        trendType: 'neutral',
        icon: 'users',
        subtitle: 'Active tenants',
        color: 'green'
      },
      {
        id: 'payments-processed',
        title: 'Payments Processed',
        value: paymentsProcessed,
        trend: 0,
        trendType: 'positive',
        icon: 'receipt',
        subtitle: `This ${timeRange.replace('d', ' days')}`,
        color: 'emerald'
      },
      {
        id: 'pending-approvals',
        title: 'Pending Approvals',
        value: pendingApprovals,
        trend: 0,
        trendType: 'neutral',
        icon: 'clock',
        subtitle: 'Awaiting your review',
        color: 'orange'
      },
      {
        id: 'receipts-issued',
        title: 'Receipts Issued',
        value: receiptsIssued,
        trend: 0,
        trendType: 'positive',
        icon: 'file-text',
        subtitle: `This ${timeRange.replace('d', ' days')}`,
        color: 'purple'
      }
    ]
    
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return getAdminDefaultStats()
  }
}

// Default stats for each role
const getLandlordDefaultStats = () => [
  { id: 'my-properties', title: 'My Properties', value: 0, trend: 0, trendType: 'neutral', icon: 'building', subtitle: 'No data', color: 'blue' },
  { id: 'my-tenants', title: 'My Tenants', value: 0, trend: 0, trendType: 'neutral', icon: 'users', subtitle: 'No data', color: 'green' },
  { id: 'monthly-revenue', title: 'Monthly Revenue', value: 'K0', trend: 0, trendType: 'neutral', icon: 'currency', subtitle: 'No data', color: 'emerald' },
  { id: 'occupancy-rate', title: 'Occupancy Rate', value: '0%', trend: 0, trendType: 'neutral', icon: 'chart-bar', subtitle: 'No data', color: 'indigo' }
]

const getTenantDefaultStats = () => [
  { id: 'current-rent', title: 'Monthly Rent', value: 'K0', trend: 0, trendType: 'neutral', icon: 'home', subtitle: 'No lease found', color: 'blue' },
  { id: 'payments-made', title: 'Payments Made', value: 0, trend: 0, trendType: 'neutral', icon: 'receipt', subtitle: 'No payments', color: 'green' },
  { id: 'account-balance', title: 'Account Balance', value: 'K0', trend: 0, trendType: 'neutral', icon: 'currency', subtitle: 'No data', color: 'emerald' },
  { id: 'next-payment', title: 'Next Payment', value: 'None', trend: 0, trendType: 'neutral', icon: 'calendar', subtitle: 'No due date', color: 'purple' }
]

const getAdminDefaultStats = () => [
  { id: 'assigned-properties', title: 'Assigned Properties', value: 0, trend: 0, trendType: 'neutral', icon: 'building', subtitle: 'No assignments', color: 'blue' },
  { id: 'managed-tenants', title: 'Managed Tenants', value: 0, trend: 0, trendType: 'neutral', icon: 'users', subtitle: 'No tenants', color: 'green' },
  { id: 'payments-processed', title: 'Payments Processed', value: 0, trend: 0, trendType: 'neutral', icon: 'receipt', subtitle: 'No activity', color: 'emerald' },
  { id: 'pending-approvals', title: 'Pending Approvals', value: 0, trend: 0, trendType: 'neutral', icon: 'clock', subtitle: 'No pending', color: 'orange' }
]

// Main GET handler
export async function GET(request) {
  let startTime = Date.now()
  
  try {
    console.log('=== SECTION STATS API CALLED ===')
    
    // Connect to database
    await connectDB()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '30d'
    const debug = searchParams.get('debug') === 'true'
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    console.log('Request params:', { timeRange, debug, forceRefresh })
    
    // Validate time range
    if (!['7d', '30d', '90d'].includes(timeRange)) {
      return NextResponse.json(
        { error: 'Invalid time range. Use 7d, 30d, or 90d' },
        { status: 400 }
      )
    }
    
    // Get current user
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.log('User:', { id: user.id, role: user.role, email: user.email })
    
    // Check cache first (unless force refresh)
    const cacheKey = getCacheKey(user.role, user.id, timeRange)
    const cachedData = statsCache.get(cacheKey)
    
    if (!forceRefresh && cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log('Returning cached stats')
      return NextResponse.json({
        success: true,
        data: cachedData.stats,
        meta: {
          userRole: user.role,
          timeRange,
          cached: true,
          generatedAt: new Date(cachedData.timestamp).toISOString(),
          responseTime: `${Date.now() - startTime}ms`
        }
      })
    }
    
    // Debug mode - run diagnostics
    if (debug) {
      console.log('Running diagnostics...')
      const diagnostics = await diagnoseFinalPaymentPerformance()
      
      return NextResponse.json({
        success: true,
        diagnostics,
        user: {
          id: user.id,
          role: user.role,
          email: user.email
        },
        cache: {
          size: statsCache.size,
          keys: Array.from(statsCache.keys())
        }
      })
    }
    
    // Get role-specific stats
    console.log('Fetching fresh stats for role:', user.role)
    const stats = await getRoleSpecificStats(user, timeRange)
    
    // Cache the results
    statsCache.set(cacheKey, {
      stats,
      timestamp: Date.now()
    })
    
    // Clean up old cache entries (keep only last 50)
    if (statsCache.size > 50) {
      const keys = Array.from(statsCache.keys())
      const oldestKeys = keys.slice(0, keys.length - 50)
      oldestKeys.forEach(key => statsCache.delete(key))
    }
    
    const responseTime = Date.now() - startTime
    console.log(`Stats fetched successfully in ${responseTime}ms`)
    
    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        userRole: user.role,
        userId: user.id,
        timeRange,
        recordCount: stats.length,
        cached: false,
        generatedAt: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        dateRange: getTimeRangeDates(timeRange)
      }
    })
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('Section stats API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      meta: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

// Optional: POST handler for clearing cache
export async function POST(request) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    if (body.action === 'clear_cache') {
      statsCache.clear()
      console.log('Stats cache cleared by admin:', user.email)
      
      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully'
      })
    }
    
    if (body.action === 'create_indexes') {
      const { createPaymentIndexes } = await import('@/lib/queries/optimizedPaymentQueries')
      await createPaymentIndexes()
      
      return NextResponse.json({
        success: true,
        message: 'Database indexes created successfully'
      })
    }
    
    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Section stats POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export for middleware or other uses
export const dynamic = 'force-dynamic'