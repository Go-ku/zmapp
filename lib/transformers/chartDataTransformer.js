// lib/transformers/chartDataTransformer.js

/**
 * Transform stats data into chart-friendly time series format
 */

// Helper function to generate date range
const generateDateRange = (days) => {
    const dates = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }
  
  // Helper function to interpolate values over time range
  const interpolateValues = (currentValue, growth, days) => {
    const values = []
    const baseValue = currentValue * (1 - (growth / 100))
    
    for (let i = 0; i < days; i++) {
      const progress = i / (days - 1)
      const value = baseValue + (currentValue - baseValue) * progress
      // Add some realistic variance
      const variance = value * 0.05 * (Math.random() - 0.5)
      values.push(Math.max(0, Math.round(value + variance)))
    }
    
    return values
  }
  
  // System Admin Data Transformations
  export const transformSystemAdminData = (stats, chartType, timeRange = '30d') => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const dates = generateDateRange(days)
    
    switch (chartType) {
      case 'revenue':
        const revenueValues = interpolateValues(
          stats.financial?.totalRevenue || 500000,
          stats.trends?.revenueGrowth || 15,
          days
        )
        const occupancyRevenueValues = interpolateValues(
          (stats.financial?.totalRevenue || 500000) * 0.8,
          stats.trends?.revenueGrowth || 15,
          days
        )
        
        return dates.map((date, index) => ({
          date,
          totalRevenue: revenueValues[index],
          occupancyRevenue: occupancyRevenueValues[index]
        }))
        
      case 'properties':
        const totalPropertyValues = interpolateValues(
          stats.properties?.totalProperties || 245,
          stats.trends?.propertyGrowth || 8,
          days
        )
        const occupiedPropertyValues = interpolateValues(
          stats.properties?.occupiedProperties || 198,
          stats.trends?.propertyGrowth || 8,
          days
        )
        
        return dates.map((date, index) => ({
          date,
          totalProperties: totalPropertyValues[index],
          occupiedProperties: occupiedPropertyValues[index]
        }))
        
      case 'users':
        const landlordValues = interpolateValues(
          stats.overview?.totalLandlords || 42,
          stats.trends?.tenantGrowth || 12,
          days
        )
        const tenantValues = interpolateValues(
          stats.overview?.totalTenants || 180,
          stats.trends?.tenantGrowth || 12,
          days
        )
        
        return dates.map((date, index) => ({
          date,
          landlords: landlordValues[index],
          tenants: tenantValues[index]
        }))
        
      default:
        return []
    }
  }
  
  // Landlord Data Transformations
  export const transformLandlordData = (stats, chartType, timeRange = '30d') => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const dates = generateDateRange(days)
    
    switch (chartType) {
      case 'revenue':
        const monthlyRevenueValues = interpolateValues(
          stats.financial?.monthlyRevenue || 18500,
          stats.trends?.revenueGrowth || 10,
          days
        )
        const projectedRevenueValues = interpolateValues(
          (stats.financial?.monthlyRevenue || 18500) * 1.08,
          stats.trends?.revenueGrowth || 10,
          days
        )
        
        return dates.map((date, index) => ({
          date,
          monthlyRevenue: monthlyRevenueValues[index],
          projectedRevenue: projectedRevenueValues[index]
        }))
        
      case 'occupancy':
        const occupancyValues = interpolateValues(
          stats.overview?.occupancyRate || 87.5,
          2, // Occupancy doesn't grow as fast
          days
        )
        
        return dates.map((date, index) => ({
          date,
          occupancyRate: Math.min(100, Math.max(0, occupancyValues[index]))
        }))
        
      case 'properties':
        const occupiedValues = interpolateValues(
          stats.properties?.occupiedProperties || 6,
          5,
          days
        )
        const vacantValues = interpolateValues(
          stats.properties?.vacantProperties || 2,
          -10, // Vacant properties should decrease
          days
        )
        const maintenanceValues = interpolateValues(
          stats.properties?.maintenanceProperties || 1,
          0, // Maintenance stays relatively stable
          days
        )
        
        return dates.map((date, index) => ({
          date,
          occupied: occupiedValues[index],
          vacant: Math.max(0, vacantValues[index]),
          maintenance: Math.max(0, maintenanceValues[index])
        }))
        
      default:
        return []
    }
  }
  
  // Tenant Data Transformations
  export const transformTenantData = (stats, chartType, timeRange = '30d') => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const dates = generateDateRange(days)
    
    switch (chartType) {
      case 'payments':
        // Generate payment history - typically monthly payments
        return dates.map((date, index) => {
          const dayOfMonth = new Date(date).getDate()
          const currentRent = stats.financial?.currentRent || 2500
          
          // Assume payment due on 1st of each month
          const amountPaid = dayOfMonth === 1 || (index > 0 && dates[index-1] && new Date(dates[index-1]).getDate() > dayOfMonth) 
            ? currentRent 
            : 0
          
          return {
            date,
            amountPaid
          }
        })
        
      case 'balance':
        const currentBalance = stats.financial?.accountBalance || 0
        
        return dates.map((date, index) => {
          // Balance typically goes up before payment, down after payment
          const dayOfMonth = new Date(date).getDate()
          let balance = currentBalance
          
          if (dayOfMonth > 15) {
            // Balance might accumulate toward month end
            balance = currentBalance + (stats.financial?.currentRent || 2500) * 0.1 * Math.random()
          }
          
          return {
            date,
            outstandingBalance: Math.max(0, balance)
          }
        })
        
      default:
        return []
    }
  }
  
  // Admin Data Transformations
  export const transformAdminData = (stats, chartType, timeRange = '30d') => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const dates = generateDateRange(days)
    
    switch (chartType) {
      case 'performance':
        const taskValues = interpolateValues(
          stats.tasks?.completedToday || 12,
          stats.performance?.monthlyRating || 15,
          days
        )
        const paymentValues = interpolateValues(
          stats.financial?.paymentsLogged || 8,
          10,
          days
        )
        
        return dates.map((date, index) => ({
          date,
          tasksCompleted: Math.max(0, taskValues[index]),
          paymentsProcessed: Math.max(0, paymentValues[index])
        }))
        
      case 'approvals':
        const approvedValues = interpolateValues(
          stats.financial?.approvedToday || 5,
          stats.performance?.accuracyRate || 5,
          days
        )
        const rejectedValues = interpolateValues(
          1, // Typically low rejection rate
          0,
          days
        )
        
        return dates.map((date, index) => ({
          date,
          approved: Math.max(0, approvedValues[index]),
          rejected: Math.max(0, Math.floor(rejectedValues[index]))
        }))
        
      default:
        return []
    }
  }
  
  // Main transformation function
  export const transformStatsToChartData = (stats, userRole, chartType, timeRange = '30d') => {
    switch (userRole) {
      case 'system_admin':
        return transformSystemAdminData(stats, chartType, timeRange)
      case 'landlord':
        return transformLandlordData(stats, chartType, timeRange)
      case 'tenant':
        return transformTenantData(stats, chartType, timeRange)
      case 'admin':
        return transformAdminData(stats, chartType, timeRange)
      default:
        return []
    }
  }
  
  // Historical data aggregation from database
  export const getHistoricalChartData = async (userRole, userId, chartType, timeRange) => {
    // This would query your actual historical data
    // For now, we'll simulate it based on current stats
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)
    
    try {
      switch (userRole) {
        case 'system_admin':
          return await getSystemAdminHistoricalData(chartType, startDate, endDate)
        case 'landlord':
          return await getLandlordHistoricalData(userId, chartType, startDate, endDate)
        case 'tenant':
          return await getTenantHistoricalData(userId, chartType, startDate, endDate)
        case 'admin':
          return await getAdminHistoricalData(userId, chartType, startDate, endDate)
        default:
          return []
      }
    } catch (error) {
      console.error('Error fetching historical chart data:', error)
      return []
    }
  }
  
  // Historical data fetchers (you would implement these with actual DB queries)
  const getSystemAdminHistoricalData = async (chartType, startDate, endDate) => {
    // Example MongoDB aggregation for revenue data
    if (chartType === 'revenue') {
      /*
      return await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalRevenue: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ])
      */
    }
    
    // Return empty for now - implement with your actual queries
    return []
  }
  
  const getLandlordHistoricalData = async (landlordId, chartType, startDate, endDate) => {
    // Implement landlord-specific historical queries
    return []
  }
  
  const getTenantHistoricalData = async (tenantId, chartType, startDate, endDate) => {
    // Implement tenant-specific historical queries
    return []
  }
  
  const getAdminHistoricalData = async (adminId, chartType, startDate, endDate) => {
    // Implement admin-specific historical queries
    return []
  }
  
  