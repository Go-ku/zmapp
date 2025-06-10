  // Role-based statistics cards
  export const getStatsCards = (role, stats) => {
    switch (role) {
      case 'systemAdmin':
        return [
          { name: 'Total Properties', value: stats.totalProperties, icon: MapPin, trend: '+12%', color: 'text-blue-600' },
          { name: 'Total Landlords', value: stats.totalLandlords, icon: Users, trend: '+8%', color: 'text-green-600' },
          { name: 'Total Tenants', value: stats.totalTenants, icon: Users, trend: '+15%', color: 'text-purple-600' },
          { name: 'Revenue (ZMW)', value: `K${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+22%', color: 'text-emerald-600' },
          { name: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, trend: '-5%', color: 'text-orange-600' },
          { name: 'Active Leases', value: stats.activeLeases, icon: FileText, trend: '+18%', color: 'text-indigo-600' }
        ];
      case 'landlord':
        return [
          { name: 'My Properties', value: stats.totalProperties, icon: MapPin, trend: '+1', color: 'text-blue-600' },
          { name: 'Total Tenants', value: stats.totalTenants, icon: Users, trend: '+3', color: 'text-green-600' },
          { name: 'Monthly Revenue', value: `K${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, trend: '+8%', color: 'text-emerald-600' },
          { name: 'Occupancy Rate', value: `${stats.occupancyRate}%`, icon: TrendingUp, trend: '+2%', color: 'text-purple-600' },
          { name: 'Pending Maintenance', value: stats.pendingMaintenance, icon: Settings, trend: '-1', color: 'text-orange-600' },
          { name: 'Overdue Payments', value: stats.overduePayments, icon: AlertCircle, trend: '0', color: 'text-red-600' }
        ];
      case 'tenant':
        return [
          { name: 'Current Rent', value: `K${stats.currentRent}`, icon: DollarSign, trend: '', color: 'text-blue-600' },
          { name: 'Next Payment Due', value: stats.nextPaymentDue, icon: Clock, trend: '8 days', color: 'text-orange-600' },
          { name: 'Lease Expires', value: stats.leaseExpiry, icon: FileText, trend: '6 months', color: 'text-purple-600' },
          { name: 'Maintenance Requests', value: stats.maintenanceRequests, icon: Settings, trend: '1 active', color: 'text-green-600' },
          { name: 'Payment History', value: `${stats.paymentHistory} months`, icon: TrendingUp, trend: 'On time', color: 'text-emerald-600' },
          { name: 'Account Balance', value: `K${stats.accountBalance}`, icon: DollarSign, trend: 'Paid up', color: 'text-green-600' }
        ];
      case 'admin':
        return [
          { name: 'Assigned Properties', value: stats.assignedProperties, icon: MapPin, trend: '', color: 'text-blue-600' },
          { name: 'Managed Tenants', value: stats.managedTenants, icon: Users, trend: '+2', color: 'text-green-600' },
          { name: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, trend: '3 new', color: 'text-orange-600' },
          { name: 'Payments Logged', value: stats.paymentsLogged, icon: DollarSign, trend: '+5 today', color: 'text-emerald-600' },
          { name: 'Receipts Issued', value: stats.receiptsIssued, icon: FileText, trend: '+3 today', color: 'text-purple-600' },
          { name: 'Monthly Target', value: `${stats.monthlyTarget}%`, icon: TrendingUp, trend: 'On track', color: 'text-indigo-600' }
        ];
      default:
        return [];
    }
  };