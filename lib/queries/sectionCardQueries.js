import mongoose from "mongoose";
import Property from "../models/Property";
import Payment from "../models/Payment";
import User from "../models/User";
import Lease from "../models/Lease";
import MaintenanceRequest from "../models/MaintenanceRequest";

/**
 * Comprehensive queries for System Admin dashboard section cards
 * Returns all key metrics and statistics for overview cards
 */

// === MAIN FUNCTION: Get all section card stats ===
export const getSystemAdminSectionStats = async (timeRange = "30d") => {
  try {
    console.log("=== Getting System Admin Section Stats ===");

    // Calculate date ranges for comparisons
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

    const currentPeriodStart = new Date(
      now.getTime() - days * 24 * 60 * 60 * 1000
    );
    const previousPeriodStart = new Date(
      now.getTime() - days * 2 * 24 * 60 * 60 * 1000
    );
    const previousPeriodEnd = currentPeriodStart;

    console.log("Date ranges:");
    console.log("Current period:", currentPeriodStart, "to", now);
    console.log(
      "Previous period:",
      previousPeriodStart,
      "to",
      previousPeriodEnd
    );

    // Get all stats in parallel for better performance
    const [
      propertyStats,
      userStats,
      revenueStats,
      paymentStats,
      occupancyStats,
      maintenanceStats,
      activityStats,
      //   growthStats
    ] = await Promise.all([
      getPropertyStats(
        currentPeriodStart,
        previousPeriodStart,
        previousPeriodEnd
      ),
      getUserStats(currentPeriodStart, previousPeriodStart, previousPeriodEnd),
      getRevenueStats(
        currentPeriodStart,
        previousPeriodStart,
        previousPeriodEnd
      ),
      getPaymentStats(currentPeriodStart),
      getOccupancyStats(),
      getMaintenanceStats(currentPeriodStart),
      getActivityStats(currentPeriodStart),
      //   getGrowthStats(currentPeriodStart, previousPeriodStart, previousPeriodEnd)
    ]);

    // Combine all stats into section card format
    const sectionCards = [
      {
        id: "total-properties",
        title: "Total Properties",
        value: propertyStats.total,
        trend: propertyStats.growth,
        trendType: propertyStats.growth >= 0 ? "positive" : "negative",
        icon: "building",
        subtitle: `${
          propertyStats.newThisPeriod
        } added this ${timeRange.replace("d", " days")}`,
        color: "blue",
      },
      {
        id: "total-landlords",
        title: "Active Landlords",
        value: userStats.landlords,
        trend: userStats.landlordGrowth,
        trendType: userStats.landlordGrowth >= 0 ? "positive" : "negative",
        icon: "users",
        subtitle: `${userStats.newLandlords} new registrations`,
        color: "green",
      },
      {
        id: "total-tenants",
        title: "Active Tenants",
        value: userStats.tenants,
        trend: userStats.tenantGrowth,
        trendType: userStats.tenantGrowth >= 0 ? "positive" : "negative",
        icon: "user-group",
        subtitle: `${userStats.newTenants} new this period`,
        color: "purple",
      },
      {
        id: "total-revenue",
        title: "Total Revenue",
        value: `K${(revenueStats.total / 1000).toFixed(0)}`,
        trend: revenueStats.growth,
        trendType: revenueStats.growth >= 0 ? "positive" : "negative",
        icon: "currency",
        subtitle: `K${(revenueStats.currentPeriod / 1000).toFixed(
          0
        )} this ${timeRange.replace("d", " days")}`,
        color: "emerald",
      },
      {
        id: "occupancy-rate",
        title: "Occupancy Rate",
        value: `${occupancyStats.rate}%`,
        trend: occupancyStats.trend,
        trendType: occupancyStats.trend >= 0 ? "positive" : "negative",
        icon: "chart-bar",
        subtitle: `${occupancyStats.occupied} of ${occupancyStats.total} units`,
        color: "indigo",
      },
      {
        id: "pending-approvals",
        title: "Pending Approvals",
        value: paymentStats.pendingApprovals,
        trend: paymentStats.approvalTrend,
        trendType: paymentStats.approvalTrend <= 0 ? "positive" : "negative", // Lower is better
        icon: "clock",
        subtitle: `K${(paymentStats.pendingAmount / 1000).toFixed(
          0
        )} total value`,
        color: "orange",
      },
      {
        id: "monthly-revenue",
        title: "Monthly Revenue",
        value: `K${(revenueStats.monthly / 1000).toFixed(0)}`,
        trend: revenueStats.monthlyGrowth,
        trendType: revenueStats.monthlyGrowth >= 0 ? "positive" : "negative",
        icon: "trending-up",
        subtitle: "This month vs last month",
        color: "cyan",
      },
      {
        id: "maintenance-requests",
        title: "Open Maintenance",
        value: maintenanceStats.open,
        trend: maintenanceStats.trend,
        trendType: maintenanceStats.trend <= 0 ? "positive" : "negative", // Lower is better
        icon: "tool",
        subtitle: `${maintenanceStats.urgent} urgent requests`,
        color: "red",
      },
      {
        id: "collection-rate",
        title: "Collection Rate",
        value: `${paymentStats.collectionRate}%`,
        trend: paymentStats.collectionTrend,
        trendType: paymentStats.collectionTrend >= 0 ? "positive" : "negative",
        icon: "receipt",
        subtitle: "Payment collection efficiency",
        color: "teal",
      },
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
    ];

    console.log("Section cards generated:", sectionCards.length);
    return sectionCards;
  } catch (error) {
    console.error("Error getting system admin section stats:", error);
    return getDefaultSectionCards();
  }
};

const getRevenueStats = async (currentStart, previousStart, previousEnd) => {
  try {
    const stats = await Payment.aggregate([
      {
        $facet: {
          total: [
            {
              $match: { status: "APPROVED" },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],
          currentPeriod: [
            {
              $match: {
                status: "APPROVED",
                createdAt: { $gte: currentStart },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],
          previousPeriod: [
            {
              $match: {
                status: "APPROVED",
                createdAt: {
                  $gte: previousStart,
                  $lt: previousEnd,
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],
          thisMonth: [
            {
              $match: {
                status: "APPROVED",
                createdAt: {
                  $gte: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1
                  ),
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],
          lastMonth: [
            {
              $match: {
                status: "APPROVED",
                createdAt: {
                  $gte: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() - 1,
                    1
                  ),
                  $lt: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1
                  ),
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];
    const total = result.total[0]?.total || 0;
    const currentPeriod = result.currentPeriod[0]?.total || 0;
    const previousPeriod = result.previousPeriod[0]?.total || 0;
    const thisMonth = result.thisMonth[0]?.total || 0;
    const lastMonth = result.lastMonth[0]?.total || 0;

    const growth =
      previousPeriod > 0
        ? (((currentPeriod - previousPeriod) / previousPeriod) * 100).toFixed(1)
        : currentPeriod > 0
        ? 100
        : 0;

    const monthlyGrowth =
      lastMonth > 0
        ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)
        : thisMonth > 0
        ? 100
        : 0;

    return {
      total,
      currentPeriod,
      monthly: thisMonth,
      growth: parseFloat(growth),
      monthlyGrowth: parseFloat(monthlyGrowth),
    };
  } catch (error) {
    console.error("Error getting revenue stats:", error);
    return {
      total: 0,
      currentPeriod: 0,
      monthly: 0,
      growth: 0,
      monthlyGrowth: 0,
    };
  }
};

// === PROPERTY STATISTICS ===
const getPropertyStats = async (currentStart, previousStart, previousEnd) => {
  try {
    const stats = await Property.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          currentPeriod: [
            {
              $match: { createdAt: { $gte: currentStart } },
            },
            { $count: "count" },
          ],
          previousPeriod: [
            {
              $match: {
                createdAt: {
                  $gte: previousStart,
                  $lt: previousEnd,
                },
              },
            },
            { $count: "count" },
          ],
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];
    const total = result.total[0]?.count || 0;
    const currentPeriod = result.currentPeriod[0]?.count || 0;
    const previousPeriod = result.previousPeriod[0]?.count || 0;

    const growth =
      previousPeriod > 0
        ? (((currentPeriod - previousPeriod) / previousPeriod) * 100).toFixed(1)
        : currentPeriod > 0
        ? 100
        : 0;

    return {
      total,
      newThisPeriod: currentPeriod,
      growth: parseFloat(growth),
      statusBreakdown: result.byStatus,
    };
  } catch (error) {
    console.error("Error getting property stats:", error);
    return { total: 0, newThisPeriod: 0, growth: 0, statusBreakdown: [] };
  }
};

// === USER STATISTICS ===
const getUserStats = async (currentStart, previousStart, previousEnd) => {
  try {
    const stats = await User.aggregate([
      {
        $facet: {
          byRole: [
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 },
              },
            },
          ],
          currentPeriodByRole: [
            {
              $match: { createdAt: { $gte: currentStart } },
            },
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 },
              },
            },
          ],
          previousPeriodByRole: [
            {
              $match: {
                createdAt: {
                  $gte: previousStart,
                  $lt: previousEnd,
                },
              },
            },
            {
              $group: {
                _id: "$role",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];

    // Helper function to get count by role
    const getCountByRole = (data, role) => {
      const item = data.find((item) => item._id === role);
      return item ? item.count : 0;
    };

    const landlords =
      getCountByRole(result.byRole, "LANDLORD") +
      getCountByRole(result.byRole, "landlord");
    const tenants =
      getCountByRole(result.byRole, "TENANT") +
      getCountByRole(result.byRole, "tenant");

    const newLandlords =
      getCountByRole(result.currentPeriodByRole, "LANDLORD") +
      getCountByRole(result.currentPeriodByRole, "landlord");
    const newTenants =
      getCountByRole(result.currentPeriodByRole, "TENANT") +
      getCountByRole(result.currentPeriodByRole, "tenant");

    const prevLandlords =
      getCountByRole(result.previousPeriodByRole, "LANDLORD") +
      getCountByRole(result.previousPeriodByRole, "landlord");
    const prevTenants =
      getCountByRole(result.previousPeriodByRole, "TENANT") +
      getCountByRole(result.previousPeriodByRole, "tenant");

    const landlordGrowth =
      prevLandlords > 0
        ? (((newLandlords - prevLandlords) / prevLandlords) * 100).toFixed(1)
        : newLandlords > 0
        ? 100
        : 0;

    const tenantGrowth =
      prevTenants > 0
        ? (((newTenants - prevTenants) / prevTenants) * 100).toFixed(1)
        : newTenants > 0
        ? 100
        : 0;

    return {
      landlords,
      tenants,
      newLandlords,
      newTenants,
      landlordGrowth: parseFloat(landlordGrowth),
      tenantGrowth: parseFloat(tenantGrowth),
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      landlords: 0,
      tenants: 0,
      newLandlords: 0,
      newTenants: 0,
      landlordGrowth: 0,
      tenantGrowth: 0,
    };
  }
};

// === PAYMENT STATISTICS ===
const getPaymentStats = async (currentStart) => {
  try {
    const stats = await Payment.aggregate([
      {
        $facet: {
          pendingApprovals: [
            {
              $match: { status: "PENDING_APPROVAL" },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                amount: { $sum: "$amount" },
              },
            },
          ],
          approvedThisPeriod: [
            {
              $match: {
                status: "APPROVED",
                createdAt: { $gte: currentStart },
              },
            },
            { $count: "count" },
          ],
          collectionRate: [
            {
              $group: {
                _id: null,
                approved: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0],
                  },
                },
                total: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];
    const pendingData = result.pendingApprovals[0] || { count: 0, amount: 0 };
    const collectionData = result.collectionRate[0] || {
      approved: 0,
      total: 1,
    };

    const collectionRate =
      collectionData.total > 0
        ? ((collectionData.approved / collectionData.total) * 100).toFixed(1)
        : 0;

    return {
      pendingApprovals: pendingData.count,
      pendingAmount: pendingData.amount,
      approvalTrend: 0, // Could calculate based on historical data
      collectionRate: parseFloat(collectionRate),
      collectionTrend: 0, // Could calculate based on historical data
    };
  } catch (error) {
    console.error("Error getting payment stats:", error);
    return {
      pendingApprovals: 0,
      pendingAmount: 0,
      approvalTrend: 0,
      collectionRate: 0,
      collectionTrend: 0,
    };
  }
};

// === OCCUPANCY STATISTICS ===
const getOccupancyStats = async () => {
  try {
    const stats = await Property.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          occupied: {
            $sum: {
              $cond: [{ $in: ["$status", ["OCCUPIED", "occupied"]] }, 1, 0],
            },
          },
        },
      },
    ]);

    const result = stats[0] || { total: 0, occupied: 0 };
    const rate =
      result.total > 0
        ? ((result.occupied / result.total) * 100).toFixed(1)
        : 0;

    return {
      total: result.total,
      occupied: result.occupied,
      rate: parseFloat(rate),
      trend: 0, // Could calculate based on historical data
    };
  } catch (error) {
    console.error("Error getting occupancy stats:", error);
    return {
      total: 0,
      occupied: 0,
      rate: 0,
      trend: 0,
    };
  }
};

// === MAINTENANCE STATISTICS ===
const getMaintenanceStats = async (currentStart) => {
  try {
    // Note: Adjust based on your MaintenanceRequest model schema
    const stats = await MaintenanceRequest.aggregate([
      {
        $facet: {
          open: [
            {
              $match: {
                status: {
                  $in: [
                    "OPEN",
                    "PENDING",
                    "IN_PROGRESS",
                    "open",
                    "pending",
                    "in_progress",
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          urgent: [
            {
              $match: {
                priority: { $in: ["URGENT", "HIGH", "urgent", "high"] },
                status: {
                  $in: [
                    "OPEN",
                    "PENDING",
                    "IN_PROGRESS",
                    "open",
                    "pending",
                    "in_progress",
                  ],
                },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]).catch(() => [{ open: [{ count: 0 }], urgent: [{ count: 0 }] }]); // Fallback if MaintenanceRequest doesn't exist

    const result = stats[0] || { open: [{ count: 0 }], urgent: [{ count: 0 }] };

    return {
      open: result.open[0]?.count || 0,
      urgent: result.urgent[0]?.count || 0,
      trend: 0, // Could calculate based on historical data
    };
  } catch (error) {
    console.error(
      "Error getting maintenance stats (model might not exist):",
      error
    );
    return {
      open: 0,
      urgent: 0,
      trend: 0,
    };
  }
};

// === ACTIVITY & HEALTH STATISTICS ===
const getActivityStats = async (currentStart) => {
  try {
    // Calculate system health based on various factors
    const [propertyHealth, paymentHealth, userHealth] = await Promise.all([
      Property.countDocuments({ status: { $in: ["OCCUPIED", "occupied"] } }),
      Payment.countDocuments({ status: "APPROVED" }),
      User.countDocuments({ isActive: true }),
    ]);

    // Simple health score calculation (can be made more sophisticated)
    const healthScore = Math.min(
      100,
      Math.round(
        (propertyHealth * 0.4 + paymentHealth * 0.4 + userHealth * 0.2) / 10
      )
    );

    return {
      healthScore,
      healthTrend: 0, // Could calculate based on historical data
    };
  } catch (error) {
    console.error("Error getting activity stats:", error);
    return {
      healthScore: 85, // Default decent score
      healthTrend: 0,
    };
  }
};

// === GROWTH STATISTICS ===
// const getGrowthStats = async (currentStart, previousStart, previousEnd) => {
//   try {
//     // This could be expanded with more sophisticated growth calculations
//     return {
//       propertyGrowth: 0,
//       userGrowth: 0,
//       revenueGrowth: 0
//     }
//   } catch (error) {
//     console.error('Error getting growth stats:', error)
//     return {
//       propertyGrowth: 0,
//       userGrowth: 0,
//       revenueGrowth: 0
//     }
//   }
// }

// === DEFAULT FALLBACK DATA ===
const getDefaultSectionCards = () => {
  return [
    {
      id: "total-properties",
      title: "Total Properties",
      value: 0,
      trend: 0,
      trendType: "neutral",
      icon: "building",
      subtitle: "No data available",
      color: "blue",
    },
    {
      id: "total-landlords",
      title: "Active Landlords",
      value: 0,
      trend: 0,
      trendType: "neutral",
      icon: "users",
      subtitle: "No data available",
      color: "green",
    },
    {
      id: "total-tenants",
      title: "Active Tenants",
      value: 0,
      trend: 0,
      trendType: "neutral",
      icon: "user-group",
      subtitle: "No data available",
      color: "purple",
    },
    {
      id: "total-revenue",
      title: "Total Revenue",
      value: "K0",
      trend: 0,
      trendType: "neutral",
      icon: "currency",
      subtitle: "No data available",
      color: "emerald",
    },
  ];
};

// === EXPORT FUNCTIONS ===
export {
  getPropertyStats,
  getUserStats,
  getRevenueStats,
  getPaymentStats,
  getOccupancyStats,
  getMaintenanceStats,
  getActivityStats,
  getGrowthStats,
};
