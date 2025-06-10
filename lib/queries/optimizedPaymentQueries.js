// lib/queries/optimizedPaymentQueries.js

import mongoose from 'mongoose'
import Payment from '../models/Payment'

// Cache for payment stats to improve performance
let cachedPaymentStats = null
let lastCacheTime = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// === MAIN FUNCTION: Get payment stats with caching and timeout handling ===
export const getPaymentStatsWithCache = async (currentStart) => {
  try {
    // Check if we have recent cached data
    const now = Date.now()
    if (cachedPaymentStats && lastCacheTime && (now - lastCacheTime) < CACHE_DURATION) {
      console.log('Using cached payment stats')
      return cachedPaymentStats
    }
    
    console.log('Fetching fresh payment stats...')
    
    // Try to get fresh data with timeout
    const statsPromise = getPaymentStatsOptimized(currentStart)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 8000)
    )
    
    try {
      const stats = await Promise.race([statsPromise, timeoutPromise])
      
      // Cache successful results
      cachedPaymentStats = stats
      lastCacheTime = now
      
      return stats
    } catch (error) {
      console.warn('Fresh query failed, trying ultra fast version:', error.message)
      
      // Fallback to ultra fast version
      const fastStats = await getPaymentStatsUltraFast()
      
      // Cache even the fast results
      cachedPaymentStats = fastStats
      lastCacheTime = now
      
      return fastStats
    }
    
  } catch (error) {
    console.error('All payment query methods failed:', error)
    
    // Return cached data if available, otherwise defaults
    return cachedPaymentStats || {
      pendingApprovals: 0,
      pendingAmount: 0,
      approvalTrend: 0,
      collectionRate: 0,
      collectionTrend: 0
    }
  }
}

// === OPTIMIZED PAYMENT STATS ===
const getPaymentStatsOptimized = async (currentStart) => {
  try {
    console.log('Getting optimized payment stats...')
    
    // Set timeout for individual queries
    const timeout = 5000 // 5 seconds
    
    // Use Promise.allSettled to handle timeouts gracefully
    const results = await Promise.allSettled([
      // Query 1: Count pending approvals
      Payment.countDocuments({ status: 'PENDING_APPROVAL' })
        .maxTimeMS(timeout),
      
      // Query 2: Sum pending approval amounts  
      Payment.aggregate([
        { $match: { status: 'PENDING_APPROVAL' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).maxTimeMS(timeout),
      
      // Query 3: Count approved payments
      Payment.countDocuments({ status: 'APPROVED' })
        .maxTimeMS(timeout),
      
      // Query 4: Count total payments
      Payment.countDocuments({})
        .maxTimeMS(timeout),
      
      // Query 5: Count approved this period
      Payment.countDocuments({ 
        status: 'APPROVED',
        createdAt: { $gte: currentStart }
      }).maxTimeMS(timeout)
    ])
    
    // Extract results with fallbacks
    const pendingCount = results[0].status === 'fulfilled' ? results[0].value : 0
    const pendingAmount = results[1].status === 'fulfilled' ? 
      (results[1].value[0]?.total || 0) : 0
    const approvedCount = results[2].status === 'fulfilled' ? results[2].value : 0
    const totalCount = results[3].status === 'fulfilled' ? results[3].value : 1
    const approvedThisPeriod = results[4].status === 'fulfilled' ? results[4].value : 0
    
    // Calculate collection rate
    const collectionRate = totalCount > 0 
      ? ((approvedCount / totalCount) * 100).toFixed(1)
      : 0
    
    console.log('Payment stats calculated:', {
      pendingCount,
      pendingAmount,
      approvedCount,
      totalCount,
      collectionRate
    })
    
    return {
      pendingApprovals: pendingCount,
      pendingAmount: pendingAmount,
      approvalTrend: 0, // Simplified for now
      collectionRate: parseFloat(collectionRate),
      collectionTrend: 0, // Simplified for now
      approvedThisPeriod
    }
    
  } catch (error) {
    console.error('Error in optimized payment stats:', error)
    return {
      pendingApprovals: 0,
      pendingAmount: 0,
      approvalTrend: 0,
      collectionRate: 0,
      collectionTrend: 0,
      approvedThisPeriod: 0
    }
  }
}

// === ULTRA FAST FALLBACK ===
const getPaymentStatsUltraFast = async () => {
  try {
    console.log('Getting ultra fast payment stats...')
    
    // Simple parallel counts with 3 second timeout
    const [pendingCount, approvedCount, totalCount] = await Promise.all([
      Payment.countDocuments({ status: 'PENDING_APPROVAL' }).maxTimeMS(3000),
      Payment.countDocuments({ status: 'APPROVED' }).maxTimeMS(3000),
      Payment.countDocuments({}).maxTimeMS(3000)
    ])
    
    // Get pending amount with a separate simple query
    let pendingAmount = 0
    try {
      const pendingSum = await Payment.aggregate([
        { $match: { status: 'PENDING_APPROVAL' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).maxTimeMS(3000)
      
      pendingAmount = pendingSum[0]?.total || 0
    } catch (error) {
      console.warn('Could not get pending amount:', error.message)
    }
    
    const collectionRate = totalCount > 0 
      ? ((approvedCount / totalCount) * 100).toFixed(1)
      : 0
    
    return {
      pendingApprovals: pendingCount,
      pendingAmount: pendingAmount,
      approvalTrend: 0,
      collectionRate: parseFloat(collectionRate),
      collectionTrend: 0
    }
    
  } catch (error) {
    console.error('Error in ultra fast payment stats:', error)
    return {
      pendingApprovals: 0,
      pendingAmount: 0,
      approvalTrend: 0,
      collectionRate: 0,
      collectionTrend: 0
    }
  }
}

// === DIAGNOSTIC FUNCTION ===
export const diagnoseFinalPaymentPerformance = async () => {
  try {
    console.log('\n=== PAYMENT COLLECTION DIAGNOSTICS ===')
    
    // Check collection size
    const totalDocs = await Payment.countDocuments().maxTimeMS(5000)
    console.log('Total payment documents:', totalDocs)
    
    // Check indexes
    const indexes = await Payment.collection.getIndexes()
    console.log('Current indexes:', Object.keys(indexes))
    
    // Check distinct status values
    const statuses = await Payment.distinct('status').maxTimeMS(5000)
    console.log('Status values:', statuses)
    
    // Test simple queries with timing
    const startTime = Date.now()
    
    const simpleCount = await Payment.countDocuments({ status: 'APPROVED' }).maxTimeMS(5000)
    const countTime = Date.now() - startTime
    
    console.log(`Simple count query took: ${countTime}ms`)
    console.log('Approved payments:', simpleCount)
    
    // Test aggregation with timing
    const aggStartTime = Date.now()
    try {
      const aggResult = await Payment.aggregate([
        { $match: { status: 'APPROVED' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]).maxTimeMS(5000)
      
      const aggTime = Date.now() - aggStartTime
      console.log(`Aggregation query took: ${aggTime}ms`)
      console.log('Aggregation result:', aggResult[0])
    } catch (error) {
      console.log('Aggregation failed:', error.message)
    }
    
    // Test cache status
    const cacheStatus = {
      hasCachedData: cachedPaymentStats !== null,
      lastCacheTime: lastCacheTime ? new Date(lastCacheTime).toISOString() : null,
      cacheAge: lastCacheTime ? Date.now() - lastCacheTime : 0,
      cacheValid: lastCacheTime && (Date.now() - lastCacheTime) < CACHE_DURATION
    }
    
    console.log('Cache status:', cacheStatus)
    
    return {
      totalDocs,
      indexes: Object.keys(indexes),
      statuses,
      simpleQueryTime: countTime,
      working: countTime < 1000, // Consider it working if under 1 second
      cache: cacheStatus,
      recommendations: getPerformanceRecommendations(countTime, totalDocs)
    }
    
  } catch (error) {
    console.error('Diagnostic failed:', error)
    return {
      totalDocs: 0,
      indexes: [],
      statuses: [],
      simpleQueryTime: 0,
      working: false,
      error: error.message,
      cache: {
        hasCachedData: false,
        lastCacheTime: null,
        cacheAge: 0,
        cacheValid: false
      }
    }
  }
}

// === HELPER FUNCTIONS ===

// Get performance recommendations based on diagnostics
const getPerformanceRecommendations = (queryTime, totalDocs) => {
  const recommendations = []
  
  if (queryTime > 1000) {
    recommendations.push('Queries are slow (>1s). Consider adding database indexes.')
  }
  
  if (totalDocs > 10000) {
    recommendations.push('Large collection detected. Consider archiving old payment records.')
  }
  
  if (queryTime > 500) {
    recommendations.push('Consider using the cached version of payment stats.')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Performance looks good! No optimizations needed.')
  }
  
  return recommendations
}

// Create database indexes for better performance
export const createPaymentIndexes = async () => {
  try {
    console.log('Creating payment indexes for better performance...')
    
    // Add these indexes to your MongoDB
    await Payment.collection.createIndex({ status: 1 })
    await Payment.collection.createIndex({ createdAt: 1 })
    await Payment.collection.createIndex({ status: 1, createdAt: 1 })
    await Payment.collection.createIndex({ dueDate: 1 })
    await Payment.collection.createIndex({ amount: 1 })
    
    console.log('Payment indexes created successfully')
    return {
      success: true,
      message: 'Indexes created successfully',
      indexes: [
        '{ status: 1 }',
        '{ createdAt: 1 }', 
        '{ status: 1, createdAt: 1 }',
        '{ dueDate: 1 }',
        '{ amount: 1 }'
      ]
    }
  } catch (error) {
    console.error('Error creating indexes (they might already exist):', error.message)
    return {
      success: false,
      message: 'Failed to create indexes',
      error: error.message
    }
  }
}

// Clear payment stats cache (useful for testing)
export const clearPaymentStatsCache = () => {
  cachedPaymentStats = null
  lastCacheTime = null
  console.log('Payment stats cache cleared')
  return {
    success: true,
    message: 'Cache cleared successfully'
  }
}

// Get cache status
export const getPaymentStatsCacheStatus = () => {
  return {
    hasCachedData: cachedPaymentStats !== null,
    lastCacheTime: lastCacheTime ? new Date(lastCacheTime).toISOString() : null,
    cacheAge: lastCacheTime ? Date.now() - lastCacheTime : 0,
    cacheValid: lastCacheTime && (Date.now() - lastCacheTime) < CACHE_DURATION,
    cacheDuration: CACHE_DURATION,
    cachedData: cachedPaymentStats
  }
}

// Export all functions
// export {
//   getPaymentStatsOptimized,
//   getPaymentStatsUltraFast,
//   createPaymentIndexes,
//   clearPaymentStatsCache,
//   getPaymentStatsCacheStatus
// }

// === USAGE EXAMPLES ===

/*
// Basic usage:
const stats = await getPaymentStatsWithCache(new Date('2024-01-01'))
console.log('Payment stats:', stats)

// Run diagnostics:
const diagnostics = await diagnoseFinalPaymentPerformance()
console.log('Performance diagnostics:', diagnostics)

// Create indexes for better performance:
const indexResult = await createPaymentIndexes()
console.log('Index creation:', indexResult)

// Clear cache if needed:
const clearResult = clearPaymentStatsCache()
console.log('Cache cleared:', clearResult)

// Check cache status:
const cacheStatus = getPaymentStatsCacheStatus()
console.log('Cache status:', cacheStatus)
*/