"use client"

import * as React from "react"
import { Button } from "./ui/button"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBrandFramerMotion,
  IconLoader
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useUser } from "@/context/UserContext"
import { useRouter } from "next/navigation"

// User roles enum
const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  LANDLORD: 'landlord',
  TENANT: 'tenant',
  ADMIN: 'admin'
}

// Permission levels
const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  APPROVE: 'approve',
  MANAGE: 'manage'
}

// Hook to fetch current user from backend
//deleted --rdm

// Role-based navigation configuration
const getNavigationConfig = (userRole, permissions = []) => {
  const baseConfig = {
    navSecondary: [
      {
        title: "Settings",
        url: "/settings",
        icon: IconSettings,
      },
      {
        title: "Get Help",
        url: "/help",
        icon: IconHelp,
      },
      {
        title: "Search",
        url: "/search",
        icon: IconSearch,
      },
    ]
  }

  switch (userRole) {
    case USER_ROLES.SYSTEM_ADMIN:
      return {
        ...baseConfig,
        navMain: [
          {
            title: "System Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
          },
          {
            title: "All Properties",
            url: "/admin/properties",
            icon: IconBuilding,
          },
          {
            title: "Landlord Management",
            url: "/admin/landlords",
            icon: IconUserCheck,
          },
          {
            title: "Tenant Management", 
            url: "/admin/tenants",
            icon: IconUsersGroup,
          },
          {
            title: "Payment System",
            url: "/admin/payments",
            icon: IconReceiptDollar,
          },
          {
            title: "System Reports",
            url: "/admin/reports",
            icon: IconBarChart3,
          },
          {
            title: "User Permissions",
            url: "/admin/permissions",
            icon: IconShield,
          },
          {
            title: "System Settings",
            url: "/admin/system-settings",
            icon: IconSettings,
          },
        ],
        documents: [
          {
            name: "System Logs",
            url: "/admin/logs",
            icon: IconDatabase,
          },
          {
            name: "Audit Reports",
            url: "/admin/audit",
            icon: IconReport,
          },
          {
            name: "Legal Documents",
            url: "/admin/legal",
            icon: IconFileWord,
          },
        ]
      }

    case USER_ROLES.LANDLORD:
      return {
        ...baseConfig,
        navMain: [
          {
            title: "Dashboard",
            url: "/landlord/dashboard",
            icon: IconDashboard,
          },
          {
            title: "My Properties",
            url: "/landlord/properties",
            icon: IconBuilding,
          },
          {
            title: "My Tenants",
            url: "/landlord/tenants",
            icon: IconUsersGroup,
          },
          {
            title: "Rent Collection",
            url: "/landlord/payments",
            icon: IconReceiptDollar,
          },
          {
            title: "Maintenance Requests",
            url: "/landlord/maintenance",
            icon: IconTool,
          },
          {
            title: "Property Reports",
            url: "/landlord/reports",
            icon: IconBarChart3,
          },
          {
            title: "Lease Management",
            url: "/landlord/leases",
            icon: IconFileText,
          },
        ],
        documents: [
          {
            name: "Active Leases",
            url: "/landlord/leases/active",
            icon: IconFileDescription,
          },
          {
            name: "Payment Records",
            url: "/landlord/payments/records",
            icon: IconReport,
          },
          {
            name: "Property Deeds",
            url: "/landlord/documents/deeds",
            icon: IconFileWord,
          },
        ]
      }

    case USER_ROLES.TENANT:
      return {
        ...baseConfig,
        navMain: [
          {
            title: "My Dashboard",
            url: "/tenant/dashboard",
            icon: IconHome,
          },
          {
            title: "My Lease",
            url: "/tenant/lease",
            icon: IconFileText,
          },
          {
            title: "Make Payment",
            url: "/tenant/payments",
            icon: IconCreditCard,
          },
          {
            title: "Payment History",
            url: "/tenant/payment-history",
            icon: IconReceiptDollar,
          },
          {
            title: "Maintenance Requests",
            url: "/tenant/maintenance",
            icon: IconTool,
          },
          {
            title: "Messages",
            url: "/tenant/messages",
            icon: IconMessageSquare,
          },
          {
            title: "Notifications",
            url: "/tenant/notifications",
            icon: IconBell,
          },
        ],
        documents: [
          {
            name: "Lease Agreement",
            url: "/tenant/lease/document",
            icon: IconFileDescription,
          },
          {
            name: "Payment Receipts",
            url: "/tenant/receipts",
            icon: IconReport,
          },
          {
            name: "Important Notices",
            url: "/tenant/notices",
            icon: IconFileText,
          },
        ]
      }

    case USER_ROLES.ADMIN:
      return {
        ...baseConfig,
        navMain: [
          {
            title: "Admin Dashboard",
            url: "/admin/dashboard",
            icon: IconDashboard,
          },
          {
            title: "Assigned Properties",
            url: "/admin/assigned-properties",
            icon: IconMapPin,
          },
          {
            title: "Manage Tenants",
            url: "/admin/manage-tenants",
            icon: IconUsersGroup,
          },
          {
            title: "Log Payments",
            url: "/admin/log-payments",
            icon: IconClipboardList,
          },
          {
            title: "Issue Receipts",
            url: "/admin/issue-receipts",
            icon: IconReceiptDollar,
          },
          {
            title: "Pending Approvals",
            url: "/admin/approvals",
            icon: IconUserCheck,
          },
          {
            title: "Reports",
            url: "/admin/reports",
            icon: IconBarChart3,
          },
        ],
        documents: [
          {
            name: "Payment Logs",
            url: "/admin/payment-logs",
            icon: IconDatabase,
          },
          {
            name: "Receipts Issued",
            url: "/admin/receipts-issued",
            icon: IconReport,
          },
          {
            name: "Approval Queue",
            url: "/admin/approval-queue",
            icon: IconClipboardList,
          },
        ]
      }

    default:
      return {
        ...baseConfig,
        navMain: [
          {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
          },
        ],
        documents: []
      }
  }
}

// Loading component
const SidebarLoading = () => (
  <Sidebar collapsible="offcanvas">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
            <IconBrandFramerMotion className="!size-5" />
            <span className="text-base font-semibold">REMA</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <div className="flex items-center justify-center p-8">
        <IconLoader className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading...</span>
      </div>
    </SidebarContent>
  </Sidebar>
)

// Error component
const SidebarError = ({ error, onRetry }) => (
  <Sidebar collapsible="offcanvas">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
            <IconBrandFramerMotion className="!size-5" />
            <span className="text-base font-semibold">REMA</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <IconAlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-sm font-medium text-gray-900 mb-2">Error Loading User Data</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </SidebarContent>
  </Sidebar>
)

// Main AppSidebar component
export function AppSidebar({ ...props }) {
  const router = useRouter()
  const { user, loading} = useUser()

  // Show loading state
  if (loading) {
    return <SidebarLoading />
  }

  // Show error state
  // if (error) {
  //   return <SidebarError error={error} onRetry={refetch} />
  // }

  // Show unauthorized if no user
  if (!user) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarContent>
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-gray-500">Please log in to continue</p>
          </div>
          <Button onClick={()=> router.push('auth/login')}>
              Log in
            </Button>
        </SidebarContent>
      </Sidebar>
    )
  }

  // Get navigation configuration based on user role
  const navConfig = getNavigationConfig(user.role, user.permissions)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard">
                <IconBrandFramerMotion className="!size-5" />
                <span className="text-base font-semibold">REMA</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={navConfig.navMain} />
        {navConfig.documents && navConfig.documents.length > 0 && (
          <NavDocuments items={navConfig.documents} />
        )}
        <NavSecondary items={navConfig.navSecondary} className="mt-auto" />
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

// Additional utility functions you might need

// Function to check if user has specific permission
export const hasPermission = (user, permission, resource = null) => {
  if (!user || !user.permissions) return false
  
  // System admins have all permissions
  if (user.role === USER_ROLES.SYSTEM_ADMIN) return true
  
  // Check specific permission
  if (resource) {
    return user.permissions.some(p => 
      p.permission === permission && 
      (p.resource === resource || p.resource === '*')
    )
  }
  
  return user.permissions.some(p => p.permission === permission)
}

// Function to filter navigation items based on permissions
export const filterNavByPermissions = (navItems, user) => {
  return navItems.filter(item => {
    // If item has no requiredPermission, show it
    if (!item.requiredPermission) return true
    
    // Check if user has required permission
    return hasPermission(user, item.requiredPermission, item.resource)
  })
}

