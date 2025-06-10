// lib/queries/chartQueries.js

import mongoose from 'mongoose'
import Property from '../models/Property'
import Payment from '../models/Payment'
import User from '../models/User'

import Lease from '../models/Lease'

/**
 * Database queries for historical chart data
 * These functions query your actual MongoDB data to create time series for charts
 */

// === SYSTEM ADMIN QUERIES ===

const getSystemRevenueData = async (startDate, endDate) => {
  try {
    console.log('Getting system revenue data from', startDate, 'to', endDate)
    
    const revenueData = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'APPROVED' // Use your actual status value
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalRevenue: { $sum: "$amount" },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          occupancyRevenue: { $multiply: ["$totalRevenue", 0.8] }
        }
      },
      {
        $project: {
          date: "$_id.date",
          totalRevenue: 1,
          occupancyRevenue: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ])

    console.log('System revenue data result:', revenueData)
    return revenueData // Should be array: [{ date: "2025-06-08", totalRevenue: 676836 }]
    
  } catch (error) {
    console.error('Error fetching system revenue data:', error)
    return []
  }
}

 const getSystemPropertyData = async (startDate, endDate) => {
  try {
    // Get daily property counts by status
    const propertyData = await Property.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          totalProperties: { $sum: "$count" },
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          }
        }
      },
      {
        $addFields: {
          occupiedProperties: {
            $sum: {
              $map: {
                input: "$statusCounts",
                as: "item",
                in: {
                  $cond: {
                    if: { $eq: ["$$item.status", "occupied"] },
                    then: "$$item.count",
                    else: 0
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          date: "$_id",
          totalProperties: 1,
          occupiedProperties: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ])

    return propertyData
  } catch (error) {
    console.error('Error fetching system property data:', error)
    return []
  }
}

 const getSystemUserData = async (startDate, endDate) => {
  try {
    const userData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            role: "$role"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          roleCounts: {
            $push: {
              role: "$_id.role",
              count: "$count"
            }
          }
        }
      },
      {
        $addFields: {
          landlords: {
            $sum: {
              $map: {
                input: "$roleCounts",
                as: "item",
                in: {
                  $cond: {
                    if: { $eq: ["$$item.role", "landlord"] },
                    then: "$$item.count",
                    else: 0
                  }
                }
              }
            }
          },
          tenants: {
            $sum: {
              $map: {
                input: "$roleCounts",
                as: "item",
                in: {
                  $cond: {
                    if: { $eq: ["$$item.role", "tenant"] },
                    then: "$$item.count",
                    else: 0
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          date: "$_id",
          landlords: 1,
          tenants: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ])

    return userData
  } catch (error) {
    console.error('Error fetching system user data:', error)
    return []
  }
}

// === LANDLORD QUERIES ===

 const getLandlordRevenueData = async (landlordId, startDate, endDate) => {
  try {
    const revenueData = await Payment.aggregate([
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
          'property.landlordId': new mongoose.Types.ObjectId(landlordId),
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'approved'] }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          monthlyRevenue: { $sum: "$amount" },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          projectedRevenue: { $multiply: ["$monthlyRevenue", 1.08] } // 8% growth projection
        }
      },
      {
        $project: {
          date: "$_id.date",
          monthlyRevenue: 1,
          projectedRevenue: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ])

    return revenueData
  } catch (error) {
    console.error('Error fetching landlord revenue data:', error)
    return []
  }
}

 const getLandlordOccupancyData = async (landlordId, startDate, endDate) => {
  try {
    const occupancyData = await Property.aggregate([
      {
        $match: {
          landlordId: new mongoose.Types.ObjectId(landlordId),
          updatedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }
          },
          totalProperties: { $sum: 1 },
          occupiedProperties: {
            $sum: {
              $cond: [{ $eq: ["$status", "occupied"] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          occupancyRate: {
            $multiply: [
              { $divide: ["$occupiedProperties", "$totalProperties"] },
              100
            ]
          }
        }
      },
      {
        $project: {
          date: "$_id.date",
          occupancyRate: { $round: ["$occupancyRate", 1] },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ])

    return occupancyData
  } catch (error) {
    console.error('Error fetching landlord occupancy data:', error)
    return []
  }
}

 const getLandlordPropertyData = async (landlordId, startDate, endDate) => {
  try {
    const propertyData = await Property.aggregate([
      {
        $match: {
          landlordId: new mongoose.Types.ObjectId(landlordId),
          updatedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          }
        }
      },
      {
        $addFields: {
          occupied: {
            $sum: {
              $map: {
                input: "$statusCounts",
                as: "item",
                in: {
                  $cond: [{ $eq: ["$$item.status", "occupied"] }, "$$item.count", 0]
                }
              }
            }
          },
          vacant: {
            $sum: {
              $map: {
                input: "$statusCounts",
                as: "item",
                in: {
                  $cond: [{ $eq: ["$$item.status", "vacant"] }, "$$item.count", 0]
                }
              }
            }
          },
          maintenance: {
            $sum: {
              $map: {
                input: "$statusCounts",
                as: "item",
                in: {
                  $cond: [{ $eq: ["$$item.status", "maintenance"] }, "$$item.count", 0]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          date: "$_id",
          occupied: 1,
          vacant: 1,
          maintenance: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ])

    return propertyData
  } catch (error) {
    console.error('Error fetching landlord property data:', error)
    return []
  }
}

// === TENANT QUERIES ===

 const getTenantPaymentData = async (tenantId, startDate, endDate) => {
  try {
    const paymentData = await Payment.aggregate([
      {
        $match: {
          tenantId: new mongoose.Types.ObjectId(tenantId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          amountPaid: { $sum: "$amount" },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $project: {
          date: "$_id.date",
          amountPaid: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ])

    return paymentData
  } catch (error) {
    console.error('Error fetching tenant payment data:', error)
    return []
  }
}

 const getTenantBalanceData = async (tenantId, startDate, endDate) => {
  try {
    // Get the tenant's active lease information
    const lease = await Lease.findOne({ 
      tenantId: new mongoose.Types.ObjectId(tenantId),
      status: 'active'
    })

    if (!lease) {
      return []
    }

    const balanceData = await Payment.aggregate([
      {
        $match: {
          tenantId: new mongoose.Types.ObjectId(tenantId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $sort: { createdAt: 1 }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          payments: { 
            $sum: {
              $cond: [
                { $in: ["$status", ["completed", "approved"]] },
                "$amount",
                0
              ]
            }
          },
          charges: { 
            $sum: {
              $cond: [
                { $in: ["$status", ["pending", "overdue"]] },
                "$amount",
                0
              ]
            }
          }
        }
      },
      {
        $addFields: {
          runningBalance: { $subtract: ["$charges", "$payments"] }
        }
      },
      {
        $project: {
          date: "$_id.date",
          outstandingBalance: { $max: [0, "$runningBalance"] },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ])

    return balanceData
  } catch (error) {
    console.error('Error fetching tenant balance data:', error)
    return []
  }
}

// === ADMIN QUERIES ===

 const getAdminPerformanceData = async (adminId, startDate, endDate) => {
  try {
    // Track admin tasks - assumes payments have a processedBy field
    const performanceData = await Payment.aggregate([
      {
        $match: {
          processedBy: new mongoose.Types.ObjectId(adminId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          paymentsProcessed: { $sum: 1 },
          tasksCompleted: { $sum: 1 } // You might have other task types
        }
      },
      {
        $project: {
          date: "$_id.date",
          tasksCompleted: 1,
          paymentsProcessed: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ])

    return performanceData
  } catch (error) {
    console.error('Error fetching admin performance data:', error)
    return []
  }
}

 const getAdminApprovalData = async (adminId, startDate, endDate) => {
  try {
    const approvalData = await Payment.aggregate([
      {
        $match: {
          processedBy: new mongoose.Types.ObjectId(adminId),
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['approved', 'rejected'] }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          }
        }
      },
      {
        $addFields: {
          approved: {
            $sum: {
              $map: {
                input: "$statusCounts",
                as: "item",
                in: {
                  $cond: [{ $eq: ["$$item.status", "approved"] }, "$$item.count", 0]
                }
              }
            }
          },
          rejected: {
            $sum: {
              $map: {
                input: "$statusCounts",
                as: "item",
                in: {
                  $cond: [{ $eq: ["$$item.status", "rejected"] }, "$$item.count", 0]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          date: "$_id",
          approved: 1,
          rejected: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ])

    return approvalData
  } catch (error) {
    console.error('Error fetching admin approval data:', error)
    return []
  }
}

// === UTILITY FUNCTIONS ===

// Fill missing dates in chart data with default values
 const fillMissingDates = (data, startDate, endDate, defaultValues = {}) => {
    if (!Array.isArray(data)) {
  console.warn("fillMissingDates received invalid data:", data)
  return []
}

  const filledData = []
  const dataMap = new Map((data || []).map(item => [item.date, item]))

  
  let currentDate = new Date(startDate)
  const end = new Date(endDate)
  
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0]
    
    if (dataMap.has(dateStr)) {
      filledData.push(dataMap.get(dateStr))
    } else {
      filledData.push({
        date: dateStr,
        ...defaultValues
      })
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return filledData
}

// Get cumulative data (for running totals)
 const getCumulativeData = (data, valueField) => {
  let cumulative = 0
  return data.map(item => ({
    ...item,
    [`cumulative${valueField.charAt(0).toUpperCase() + valueField.slice(1)}`]: 
      cumulative += (item[valueField] || 0)
  }))
}

// Calculate moving averages
 const getMovingAverage = (data, valueField, windowSize = 7) => {
  return data.map((item, index) => {
    const start = Math.max(0, index - windowSize + 1)
    const window = data.slice(start, index + 1)
    const average = window.reduce((sum, d) => sum + (d[valueField] || 0), 0) / window.length
    
    return {
      ...item,
      [`${valueField}MovingAvg`]: Math.round(average * 100) / 100
    }
  })
}

// Get default values for different chart types
const getDefaultValuesForChartType = (chartType) => {
  const defaults = {
    revenue: { totalRevenue: 0, monthlyRevenue: 0, projectedRevenue: 0, occupancyRevenue: 0 },
    properties: { totalProperties: 0, occupiedProperties: 0, occupied: 0, vacant: 0, maintenance: 0 },
    users: { landlords: 0, tenants: 0 },
    occupancy: { occupancyRate: 0 },
    payments: { amountPaid: 0 },
    balance: { outstandingBalance: 0 },
    performance: { tasksCompleted: 0, paymentsProcessed: 0 },
    approvals: { approved: 0, rejected: 0 }
  }
  
  return defaults[chartType] || {}
}

// Main function to get historical data from database
 const getHistoricalChartDataFromDB = async (userRole, userId, chartType, startDate, endDate) => {
  try {
    let data = []
    
    switch (userRole) {
      case 'SYSTEM_ADMIN':
        switch (chartType) {
          case 'revenue':
            data = await getSystemRevenueData(startDate, endDate)
            break
          case 'properties':
            data = await getSystemPropertyData(startDate, endDate)
            break
          case 'users':
            data = await getSystemUserData(startDate, endDate)
            break
          default:
            data = await getSystemRevenueData(startDate, endDate)
        }
        break
        
      case 'landlord':
        switch (chartType) {
          case 'revenue':
            data = await getLandlordRevenueData(userId, startDate, endDate)
            break
          case 'occupancy':
            data = await getLandlordOccupancyData(userId, startDate, endDate)
            break
          case 'properties':
            data = await getLandlordPropertyData(userId, startDate, endDate)
            break
          default:
            data = await getLandlordRevenueData(userId, startDate, endDate)
        }
        break
        
      case 'tenant':
        switch (chartType) {
          case 'payments':
            data = await getTenantPaymentData(userId, startDate, endDate)
            break
          case 'balance':
            data = await getTenantBalanceData(userId, startDate, endDate)
            break
          default:
            data = await getTenantPaymentData(userId, startDate, endDate)
        }
        break
        
      case 'admin':
        switch (chartType) {
          case 'performance':
            data = await getAdminPerformanceData(userId, startDate, endDate)
            break
          case 'approvals':
            data = await getAdminApprovalData(userId, startDate, endDate)
            break
          default:
            data = await getAdminPerformanceData(userId, startDate, endDate)
        }
        break
        
      default:
        console.warn(`Unknown user role: ${userRole}`)
        return []
    }
    if (!Array.isArray(data)) {
      console.error(`Database query returned non-array:`, data)
      return [] // Return empty array instead of invalid data
    }
    
    console.log(`Raw chart data:`, data.slice(0, 2)) // Show sample
    
    // Only call fillMissingDates with valid array data
    const defaultValues = getDefaultValuesForChartType(chartType)
    const filledData = fillMissingDates(data, startDate, endDate, defaultValues)
    
    return filledData
    
  } catch (error) {
    console.error('Error fetching historical chart data from DB:', error)
    return []
  }
}

// Test function to verify queries work
 const testChartQueries = async (userRole = 'system_admin', chartType = 'revenue') => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    console.log(`Testing ${userRole} ${chartType} query...`)
    
    const data = await getHistoricalChartDataFromDB(
      userRole,
      '507f1f77bcf86cd799439011', // Test ObjectId
      chartType,
      startDate,
      endDate
    )
    
    console.log(`Query returned ${data.length} records`)
    console.log('Sample data:', data.slice(0, 3))
    
    return data
    
  } catch (error) {
    console.error('Test failed:', error)
    return []
  }
}

// Export all functions
export  {
  getSystemRevenueData,
  getSystemPropertyData,
  getSystemUserData,
  getLandlordRevenueData,
  getLandlordOccupancyData,
  getLandlordPropertyData,
  getTenantPaymentData,
  getTenantBalanceData,
  getAdminPerformanceData,
  getAdminApprovalData,
  getHistoricalChartDataFromDB,
  fillMissingDates,
  getCumulativeData,
  getMovingAverage,
  testChartQueries
}