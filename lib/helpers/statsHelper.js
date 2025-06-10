// lib/helpers/statsHelper.js

import Property from '../models/Property'
import User from '../models/User'
import Payment from '../models/Payment'
import Lease from '../models/Lease'
import MaintenanceRequest from '../models/MaintenanceRequest'

// User roles enum
const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  LANDLORD: 'landlord',
  TENANT: 'tenant',
  ADMIN: 'admin'
}

/**
 * Get dashboard statistics based on user role and permissions
 * @param {Object} user - Current user object with role and permissions
 * @param {string} dateRange - Optional date range filter ('7d', '30d', '90d', '1y')
 * @returns {Object} Formatted statistics data for dashboard
 */
async function getDashboardStats(user, dateRange = '30d') {
  try {
    if (!user || !user.role) {
      throw new Error('Invalid user data')
    }

    // Get date filter based on range
    const dateFilter = getDateFilter(dateRange)

    switch (user.role) {
      case USER_ROLES.SYSTEM_ADMIN:
        return await getSystemAdminStats(dateFilter)
      
      case USER_ROLES.LANDLORD:
        return await getLandlordStats(user.id, dateFilter)
      
      case USER_ROLES.TENANT:
        return await getTenantStats(user.id, dateFilter)
      
      case USER_ROLES.ADMIN:
        return await getAdminStats(user.id, user.landlordId, dateFilter)
      
      default:
        throw new Error(`Unknown user role: ${user.role}`)
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return getEmptyStats(user.role)
  }
}

/**
 * System Administrator Statistics
 */
async function getSystemAdminStats(dateFilter) {
  try {
    const [
      propertyStats,
      userStats,
      paymentStats,
      leaseStats,
      maintenanceStats,
      revenueStats
    ] = await Promise.all([
      Property.getSystemStats(dateFilter),
      User.getSystemStats(dateFilter),
      Payment.getSystemStats(dateFilter),
      Lease.getSystemStats(dateFilter),
      MaintenanceRequest.getSystemStats(dateFilter),
      Payment.getRevenueStats(dateFilter)
    ])

    return {
      overview: {
        totalProperties: propertyStats.total,
        totalLandlords: userStats.landlords,
        totalTenants: userStats.tenants,
        totalAdmins: userStats.admins,
        occupancyRate: propertyStats.occupancyRate,
        activeLeases: leaseStats.active
      },
      financial: {
        totalRevenue: revenueStats.total,
        monthlyRevenue: revenueStats.monthly,
        revenueGrowth: revenueStats.growth,
        pendingPayments: paymentStats.pending,
        overduePayments: paymentStats.overdue,
        averageRent: propertyStats.averageRent
      },
      properties: {
        totalProperties: propertyStats.total,
        occupiedProperties: propertyStats.occupied,
        vacantProperties: propertyStats.vacant,
        maintenanceProperties: propertyStats.maintenance,
        propertyTypes: propertyStats.byType,
        locationDistribution: propertyStats.byLocation
      },
      operations: {
        pendingApprovals: paymentStats.pendingApprovals + leaseStats.pendingApprovals,
        maintenanceRequests: maintenanceStats.open,
        urgentMaintenance: maintenanceStats.urgent,
        newRegistrations: userStats.newThisMonth,
        systemAlerts: await getSystemAlerts()
      },
      trends: {
        propertyGrowth: propertyStats.growth,
        tenantGrowth: userStats.tenantGrowth,
        revenueGrowth: revenueStats.growth,
        occupancyTrend: propertyStats.occupancyTrend
      }
    }
  } catch (error) {
    console.error('Error fetching system admin stats:', error)
    throw error
  }
}

/**
 * Landlord Statistics
 */
async function getLandlordStats(landlordId, dateFilter) {
  try {
    const [
      propertyStats,
      tenantStats,
      paymentStats,
      leaseStats,
      maintenanceStats,
      revenueStats
    ] = await Promise.all([
      Property.getLandlordStats(landlordId, dateFilter),
      Tenant.getLandlordStats(landlordId, dateFilter),
      Payment.getLandlordStats(landlordId, dateFilter),
      Lease.getLandlordStats(landlordId, dateFilter),
      MaintenanceRequest.getLandlordStats(landlordId, dateFilter),
      Payment.getLandlordRevenueStats(landlordId, dateFilter)
    ])

    return {
      overview: {
        totalProperties: propertyStats.total,
        totalTenants: tenantStats.total,
        occupancyRate: propertyStats.occupancyRate,
        activeLeases: leaseStats.active,
        portfolioValue: propertyStats.totalValue
      },
      financial: {
        monthlyRevenue: revenueStats.monthly,
        yearlyRevenue: revenueStats.yearly,
        revenueGrowth: revenueStats.growth,
        pendingPayments: paymentStats.pending,
        overduePayments: paymentStats.overdue,
        collectionRate: paymentStats.collectionRate,
        averageRent: propertyStats.averageRent
      },
      properties: {
        totalProperties: propertyStats.total,
        occupiedProperties: propertyStats.occupied,
        vacantProperties: propertyStats.vacant,
        maintenanceProperties: propertyStats.maintenance,
        propertyTypes: propertyStats.byType,
        topPerformingProperties: propertyStats.topPerforming
      },
      tenants: {
        totalTenants: tenantStats.total,
        newTenants: tenantStats.newThisMonth,
        leavingTenants: tenantStats.leavingThisMonth,
        goodStandingTenants: tenantStats.goodStanding,
        overduePaymentTenants: tenantStats.overduePayments
      },
      operations: {
        pendingApprovals: paymentStats.pendingApprovals,
        maintenanceRequests: maintenanceStats.open,
        urgentMaintenance: maintenanceStats.urgent,
        leaseRenewals: leaseStats.renewalsThisMonth,
        leaseExpirations: leaseStats.expiringSoon
      },
      trends: {
        revenueGrowth: revenueStats.growth,
        occupancyTrend: propertyStats.occupancyTrend,
        tenantRetention: tenantStats.retentionRate,
        maintenanceCosts: maintenanceStats.costTrend
      }
    }
  } catch (error) {
    console.error('Error fetching landlord stats:', error)
    throw error
  }
}

/**
 * Tenant Statistics
 */
async function getTenantStats(tenantId, dateFilter) {
  try {
    const [
      leaseInfo,
      paymentStats,
      maintenanceStats,
      tenantInfo
    ] = await Promise.all([
      Lease.getTenantStats(tenantId, dateFilter),
      Payment.getTenantStats(tenantId, dateFilter),
      MaintenanceRequest.getTenantStats(tenantId, dateFilter),
      Tenant.getTenantInfo(tenantId)
    ])

    return {
      overview: {
        currentRent: leaseInfo.currentRent,
        leaseStartDate: leaseInfo.startDate,
        leaseEndDate: leaseInfo.endDate,
        propertyName: leaseInfo.propertyName,
        landlordName: leaseInfo.landlordName,
        accountStatus: tenantInfo.accountStatus
      },
      financial: {
        currentRent: leaseInfo.currentRent,
        nextPaymentDue: paymentStats.nextPaymentDue,
        nextPaymentAmount: paymentStats.nextPaymentAmount,
        accountBalance: paymentStats.balance,
        totalPaid: paymentStats.totalPaid,
        paymentHistory: paymentStats.historyCount,
        lastPaymentDate: paymentStats.lastPaymentDate,
        paymentStatus: paymentStats.status
      },
      lease: {
        leaseEndDate: leaseInfo.endDate,
        renewalOption: leaseInfo.renewalOption,
        securityDeposit: leaseInfo.securityDeposit,
        monthsRemaining: leaseInfo.monthsRemaining,
        renewalNotificationDate: leaseInfo.renewalNotificationDate,
        leaseType: leaseInfo.type
      },
      maintenance: {
        activeRequests: maintenanceStats.active,
        completedRequests: maintenanceStats.completed,
        totalRequests: maintenanceStats.total,
        averageResponseTime: maintenanceStats.averageResponseTime,
        lastRequestDate: maintenanceStats.lastRequestDate
      },
      notifications: {
        paymentReminders: await getPaymentReminders(tenantId),
        leaseReminders: await getLeaseReminders(tenantId),
        maintenanceUpdates: await getMaintenanceUpdates(tenantId),
        generalNotices: await getGeneralNotices(tenantId)
      }
    }
  } catch (error) {
    console.error('Error fetching tenant stats:', error)
    throw error
  }
}

/**
 * Admin Statistics
 */
async function getAdminStats(adminId, landlordId, dateFilter) {
  try {
    const [
      assignedPropertyStats,
      managedTenantStats,
      paymentStats,
      approvalStats,
      taskStats
    ] = await Promise.all([
      Property.getAdminStats(adminId, landlordId, dateFilter),
      Tenant.getAdminStats(adminId, landlordId, dateFilter),
      Payment.getAdminStats(adminId, landlordId, dateFilter),
      getAdminApprovalStats(adminId, dateFilter),
      getAdminTaskStats(adminId, dateFilter)
    ])

    return {
      overview: {
        assignedProperties: assignedPropertyStats.total,
        managedTenants: managedTenantStats.total,
        monthlyTarget: taskStats.monthlyTarget,
        targetProgress: taskStats.progress,
        performanceRating: taskStats.rating
      },
      financial: {
        paymentsLogged: paymentStats.logged,
        receiptsIssued: paymentStats.receiptsIssued,
        pendingApprovals: approvalStats.pending,
        approvedToday: approvalStats.approvedToday,
        totalProcessed: paymentStats.totalProcessed,
        processingAccuracy: paymentStats.accuracy
      },
      properties: {
        assignedProperties: assignedPropertyStats.total,
        occupiedUnits: assignedPropertyStats.occupied,
        vacantUnits: assignedPropertyStats.vacant,
        maintenanceUnits: assignedPropertyStats.maintenance,
        collectionRate: paymentStats.collectionRate
      },
      tenants: {
        managedTenants: managedTenantStats.total,
        newTenants: managedTenantStats.newThisMonth,
        goodStandingTenants: managedTenantStats.goodStanding,
        tenantIssues: managedTenantStats.issues,
        tenantSatisfaction: managedTenantStats.satisfaction
      },
      tasks: {
        pendingApprovals: approvalStats.pending,
        completedToday: taskStats.completedToday,
        monthlyTarget: taskStats.monthlyTarget,
        targetProgress: taskStats.progress,
        averageProcessingTime: taskStats.averageProcessingTime
      },
      performance: {
        accuracyRate: paymentStats.accuracy,
        responseTime: taskStats.averageResponseTime,
        customerSatisfaction: taskStats.customerSatisfaction,
        tasksCompleted: taskStats.totalCompleted,
        monthlyRating: taskStats.monthlyRating
      }
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    throw error
  }
}

/**
 * Utility Functions
 */

// Get date filter object based on range
function getDateFilter(dateRange) {
  const now = new Date()
  const filters = {
    '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  }
  
  return {
    start: filters[dateRange] || filters['30d'],
    end: now
  }
}

// Get system alerts for admin dashboard
async function getSystemAlerts() {
  try {
    const alerts = await Promise.all([
      Property.getSystemAlerts(),
      Payment.getSystemAlerts(),
      User.getSystemAlerts(),
      MaintenanceRequest.getSystemAlerts()
    ])
    
    return alerts.flat().sort((a, b) => b.priority - a.priority)
  } catch (error) {
    console.error('Error fetching system alerts:', error)
    return []
  }
}

// Get admin approval stats
async function getAdminApprovalStats(adminId, dateFilter) {
  try {
    return {
      pending: await Payment.countPendingApprovals(adminId),
      approvedToday: await Payment.countApprovedToday(adminId),
      rejectedToday: await Payment.countRejectedToday(adminId),
      totalThisMonth: await Payment.countApprovalsThisMonth(adminId)
    }
  } catch (error) {
    console.error('Error fetching admin approval stats:', error)
    return { pending: 0, approvedToday: 0, rejectedToday: 0, totalThisMonth: 0 }
  }
}

// Get admin task stats
async function getAdminTaskStats(adminId, dateFilter) {
  try {
    // This would integrate with your task/performance tracking system
    return {
      monthlyTarget: 100, // This could come from admin settings
      progress: 85,
      rating: 4.2,
      completedToday: 12,
      totalCompleted: 340,
      averageProcessingTime: '2.5 hours',
      averageResponseTime: '1.2 hours',
      customerSatisfaction: 4.1,
      monthlyRating: 4.3
    }
  } catch (error) {
    console.error('Error fetching admin task stats:', error)
    return {
      monthlyTarget: 0,
      progress: 0,
      rating: 0,
      completedToday: 0,
      totalCompleted: 0,
      averageProcessingTime: 'N/A',
      averageResponseTime: 'N/A',
      customerSatisfaction: 0,
      monthlyRating: 0
    }
  }
}

// Get notifications for tenants
async function getPaymentReminders(tenantId) {
  // Implementation would fetch actual payment reminders
  return []
}

async function getLeaseReminders(tenantId) {
  // Implementation would fetch lease-related reminders
  return []
}

async function getMaintenanceUpdates(tenantId) {
  // Implementation would fetch maintenance updates
  return []
}

async function getGeneralNotices(tenantId) {
  // Implementation would fetch general notices
  return []
}

// Return empty stats structure for error cases
function getEmptyStats(userRole) {
  const baseStats = {
    overview: {},
    financial: {},
    error: true,
    message: 'Unable to load statistics'
  }

  switch (userRole) {
    case USER_ROLES.SYSTEM_ADMIN:
      return {
        ...baseStats,
        properties: {},
        operations: {},
        trends: {}
      }
    case USER_ROLES.LANDLORD:
      return {
        ...baseStats,
        properties: {},
        tenants: {},
        operations: {},
        trends: {}
      }
    case USER_ROLES.TENANT:
      return {
        ...baseStats,
        lease: {},
        maintenance: {},
        notifications: {}
      }
    case USER_ROLES.ADMIN:
      return {
        ...baseStats,
        properties: {},
        tenants: {},
        tasks: {},
        performance: {}
      }
    default:
      return baseStats
  }
}

/**
 * Export the main function and utilities
 */
export {
  getDashboardStats,
  getSystemAdminStats,
  getLandlordStats,
  getTenantStats,
  getAdminStats,
  USER_ROLES
}

// Usage Example:
/*
// In your dashboard component or API route
import { getDashboardStats } from '@/lib/helpers/statsHelper'

export async function GET(request) {
  try {
    const user = await getCurrentUser(request)
    const dateRange = request.nextUrl.searchParams.get('range') || '30d'
    
    const stats = await getDashboardStats(user, dateRange)
    
    return Response.json(stats)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch dashboard stats' }, 
      { status: 500 }
    )
  }
}
*/