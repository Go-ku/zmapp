"use client"

import * as React from "react"
import {
  IconBuilding,
  IconCalendar,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconCurrencyDollar,
  IconDotsVertical,
  IconLayoutColumns,
  IconPlus,
  IconUser,
  IconUsers,
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
  IconAlertTriangle,
  IconSend,
  IconReceipt,
  IconFileText,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Table components
const Table = ({ children, ...props }) => (
  <table className="w-full caption-bottom text-sm" {...props}>
    {children}
  </table>
)

const TableHeader = ({ children, ...props }) => (
  <thead className="[&_tr]:border-b" {...props}>
    {children}
  </thead>
)

const TableBody = ({ children, ...props }) => (
  <tbody className="[&_tr:last-child]:border-0" {...props}>
    {children}
  </tbody>
)

const TableHead = ({ children, className = "", ...props }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
    {children}
  </th>
)

const TableRow = ({ children, className = "", ...props }) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`} {...props}>
    {children}
  </tr>
)

const TableCell = ({ children, className = "", ...props }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>
    {children}
  </td>
)

// User roles for demonstration
const USER_ROLES = {
  SYSTEM_ADMIN: "system_admin",
  LANDLORD: "landlord", 
  TENANT: "tenant",
  ADMIN: "admin"
}

// Mock user context - in real app this would come from auth
const currentUser = {
  role: USER_ROLES.LANDLORD,
  id: "landlord_001",
  name: "John Doe"
}

export const propertySchema = z.object({
  id: z.string(),
  propertyName: z.string(),
  tenant: z.string(),
  rentAmount: z.number(),
  status: z.string(),
  dueDate: z.string(),
  paymentStatus: z.string(),
  landlord: z.string(),
  location: z.string(),
  propertyType: z.string(),
  lastPayment: z.string(),
  balance: z.number(),
  approvalStatus: z.string().optional(),
})

export const paymentsSchema = z.object({
  id: z.string(),
  property: z.string(),
  tenant: z.string(),
  amount: z.number(),
  date: z.string(),
  status: z.string(),
  method: z.string(),
  reference: z.string(),
  approvedBy: z.string().optional(),
  needsApproval: z.boolean(),
})

export const tenantsSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  property: z.string(),
  rentAmount: z.number(),
  leaseStart: z.string(),
  leaseEnd: z.string(),
  status: z.string(),
  balance: z.number(),
})

// Sample data
const propertyData = [
  {
    id: "prop_001",
    propertyName: "Sunset Apartments Unit 101",
    tenant: "Jane Smith",
    rentAmount: 8500,
    status: "Occupied",
    dueDate: "2025-06-15",
    paymentStatus: "Overdue",
    landlord: "John Doe",
    location: "Lusaka, Zambia",
    propertyType: "Apartment",
    lastPayment: "2025-05-15",
    balance: -2500,
    approvalStatus: "pending"
  },
  {
    id: "prop_002", 
    propertyName: "Garden View House",
    tenant: "Mike Johnson",
    rentAmount: 12000,
    status: "Occupied",
    dueDate: "2025-06-20",
    paymentStatus: "Paid",
    landlord: "John Doe",
    location: "Lusaka, Zambia",
    propertyType: "House",
    lastPayment: "2025-06-18",
    balance: 0,
    approvalStatus: "approved"
  },
  {
    id: "prop_003",
    propertyName: "City Center Studio",
    tenant: "Sarah Wilson",
    rentAmount: 6000,
    status: "Occupied", 
    dueDate: "2025-06-10",
    paymentStatus: "Pending",
    landlord: "John Doe",
    location: "Lusaka, Zambia",
    propertyType: "Studio",
    lastPayment: "2025-05-10",
    balance: -1000,
    approvalStatus: "pending"
  },
  {
    id: "prop_004",
    propertyName: "Executive Townhouse",
    tenant: "David Brown",
    rentAmount: 15000,
    status: "Occupied",
    dueDate: "2025-06-25",
    paymentStatus: "Paid",
    landlord: "John Doe",
    location: "Lusaka, Zambia",
    propertyType: "Townhouse",
    lastPayment: "2025-06-22",
    balance: 0,
    approvalStatus: "approved"
  },
  {
    id: "prop_005",
    propertyName: "Modern Flat B12",
    tenant: "Lisa Garcia",
    rentAmount: 7500,
    status: "Occupied",
    dueDate: "2025-06-30",
    paymentStatus: "Overdue",
    landlord: "John Doe",
    location: "Lusaka, Zambia",
    propertyType: "Apartment",
    lastPayment: "2025-05-30",
    balance: -3500,
    approvalStatus: "pending"
  }
]

const paymentData = [
  {
    id: "pay_001",
    property: "Sunset Apartments Unit 101",
    tenant: "Jane Smith", 
    amount: 8500,
    date: "2025-06-12",
    status: "Pending Approval",
    method: "Bank Transfer",
    reference: "TXN123456",
    needsApproval: true
  },
  {
    id: "pay_002",
    property: "Garden View House",
    tenant: "Mike Johnson",
    amount: 12000, 
    date: "2025-06-18",
    status: "Approved",
    method: "Mobile Money",
    reference: "MM789012",
    approvedBy: "John Doe",
    needsApproval: false
  },
  {
    id: "pay_003",
    property: "Executive Townhouse",
    tenant: "David Brown",
    amount: 15000,
    date: "2025-06-22",
    status: "Approved",
    method: "Cash",
    reference: "CASH345678",
    approvedBy: "John Doe",
    needsApproval: false
  },
  {
    id: "pay_004",
    property: "Modern Flat B12",
    tenant: "Lisa Garcia",
    amount: 7500,
    date: "2025-06-11",
    status: "Pending Approval",
    method: "Mobile Money",
    reference: "MM456789",
    needsApproval: true
  }
]

const tenantData = [
  {
    id: "ten_001",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "+260 97 123 4567",
    property: "Sunset Apartments Unit 101", 
    rentAmount: 8500,
    leaseStart: "2024-01-01",
    leaseEnd: "2025-12-31",
    status: "Active",
    balance: -2500
  },
  {
    id: "ten_002",
    name: "Mike Johnson", 
    email: "mike.johnson@email.com",
    phone: "+260 97 234 5678",
    property: "Garden View House",
    rentAmount: 12000,
    leaseStart: "2024-06-01", 
    leaseEnd: "2026-05-31",
    status: "Active",
    balance: 0
  },
  {
    id: "ten_003",
    name: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    phone: "+260 97 345 6789",
    property: "City Center Studio",
    rentAmount: 6000,
    leaseStart: "2024-03-01",
    leaseEnd: "2025-02-28",
    status: "Active",
    balance: -1000
  },
  {
    id: "ten_004",
    name: "David Brown",
    email: "david.brown@email.com",
    phone: "+260 97 456 7890",
    property: "Executive Townhouse",
    rentAmount: 15000,
    leaseStart: "2024-08-01",
    leaseEnd: "2026-07-31",
    status: "Active",
    balance: 0
  },
  {
    id: "ten_005",
    name: "Lisa Garcia",
    email: "lisa.garcia@email.com",
    phone: "+260 97 567 8901",
    property: "Modern Flat B12",
    rentAmount: 7500,
    leaseStart: "2024-04-01",
    leaseEnd: "2025-03-31",
    status: "Active",
    balance: -3500
  }
]

// Property columns
const propertyColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row" />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "propertyName",
    header: "Property",
    cell: ({ row }) => {
      return <PropertyViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "tenant",
    header: "Tenant",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconUser className="size-4 text-muted-foreground" />
        <span>{row.original.tenant}</span>
      </div>
    ),
  },
  {
    accessorKey: "rentAmount",
    header: () => <div className="text-right">Rent Amount</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        K{row.original.rentAmount.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.original.paymentStatus
      return (
        <Badge 
          variant={
            status === "Paid" ? "default" : 
            status === "Overdue" ? "destructive" : "secondary"
          }
          className="text-xs">
          {status === "Paid" && <IconCircleCheckFilled className="mr-1 size-3" />}
          {status === "Overdue" && <IconAlertTriangle className="mr-1 size-3" />}
          {status === "Pending" && <IconClock className="mr-1 size-3" />}
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconCalendar className="size-4 text-muted-foreground" />
        <span>{new Date(row.original.dueDate).toLocaleDateString()}</span>
      </div>
    ),
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }) => {
      const balance = row.original.balance
      return (
        <div className={`text-right font-mono ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {balance < 0 ? '-' : ''}K{Math.abs(balance).toLocaleString()}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon">
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <IconFileText className="mr-2 size-4" />
            View Lease
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconReceipt className="mr-2 size-4" />
            Payment History
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconSend className="mr-2 size-4" />
            Send Reminder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <IconPhone className="mr-2 size-4" />
            WhatsApp Tenant
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

// Payment columns
const paymentColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row" />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.original.reference}</div>
    ),
  },
  {
    accessorKey: "property",
    header: "Property",
  },
  {
    accessorKey: "tenant", 
    header: "Tenant",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        K{row.original.amount.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div>{new Date(row.original.date).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const needsApproval = row.original.needsApproval
      return (
        <div className="flex items-center gap-2">
          <Badge 
            variant={
              status === "Approved" ? "default" : 
              needsApproval ? "secondary" : "outline"
            }>
            {needsApproval && <IconClock className="mr-1 size-3" />}
            {status === "Approved" && <IconCircleCheckFilled className="mr-1 size-3" />}
            {status}
          </Badge>
          {needsApproval && currentUser.role === USER_ROLES.LANDLORD && (
            <Button size="sm" variant="outline" onClick={() => {
              toast.success("Payment approved and receipt generated")
            }}>
              Approve
            </Button>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon">
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <IconReceipt className="mr-2 size-4" />
            Generate Receipt
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconSend className="mr-2 size-4" />
            Send via WhatsApp
          </DropdownMenuItem>
          {row.original.needsApproval && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-green-600">
                <IconCircleCheckFilled className="mr-2 size-4" />
                Approve Payment
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <IconAlertTriangle className="mr-2 size-4" />
                Reject Payment
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

// Tenant columns
const tenantColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row" />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Tenant Name",
    cell: ({ row }) => {
      return <TenantViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "property",
    header: "Property",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconBuilding className="size-4 text-muted-foreground" />
        <span>{row.original.property}</span>
      </div>
    ),
  },
  {
    accessorKey: "rentAmount",
    header: () => <div className="text-right">Rent</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        K{row.original.rentAmount.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "leaseEnd",
    header: "Lease Expires",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconCalendar className="size-4 text-muted-foreground" />
        <span>{new Date(row.original.leaseEnd).toLocaleDateString()}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "Active" ? "default" : "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }) => {
      const balance = row.original.balance
      return (
        <div className={`text-right font-mono ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {balance < 0 ? '-' : ''}K{Math.abs(balance).toLocaleString()}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon">
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <IconMail className="mr-2 size-4" />
            Send Invoice
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconPhone className="mr-2 size-4" />
            WhatsApp Reminder
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconFileText className="mr-2 size-4" />
            View Lease Agreement
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <IconReceipt className="mr-2 size-4" />
            Payment History
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function RealEstateDataTable({ 
  data: initialData, 
  type = "properties",
  columns: customColumns 
}) {
  // Select appropriate columns and data based on type
  const columns = customColumns || (
    type === "properties" ? propertyColumns :
    type === "payments" ? paymentColumns :
    type === "tenants" ? tenantColumns :
    propertyColumns
  )

  const currentData = 
    type === "properties" ? propertyData :
    type === "payments" ? paymentData :
    type === "tenants" ? tenantData :
    propertyData

  return (
    <Tabs defaultValue={type} className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue={type}>
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="properties">Properties</SelectItem>
            <SelectItem value="payments">Payments</SelectItem>
            <SelectItem value="tenants">Tenants</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="properties">
            <IconBuilding className="mr-2 size-4" />
            Properties
            <Badge variant="secondary" className="ml-2">
              {propertyData.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="payments">
            <IconCurrencyDollar className="mr-2 size-4" />
            Payments
            <Badge variant="secondary" className="ml-2">
              {paymentData.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="tenants">
            <IconUsers className="mr-2 size-4" />
            Tenants
            <Badge variant="secondary" className="ml-2">
              {tenantData.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            Maintenance
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add {type === "properties" ? "Property" : type === "payments" ? "Payment" : type === "tenants" ? "Tenant" : "Item"}</span>
          </Button>
        </div>
      </div>

      {/* Properties Tab */}
      <TabsContent
        value="properties"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <DataTableComponent 
          data={propertyData}
          columns={propertyColumns}
        />
      </TabsContent>

      {/* Payments Tab */}
      <TabsContent
        value="payments" 
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <DataTableComponent 
          data={paymentData}
          columns={paymentColumns}
        />
      </TabsContent>

      {/* Tenants Tab */}
      <TabsContent
        value="tenants"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <DataTableComponent 
          data={tenantData}
          columns={tenantColumns}
        />
      </TabsContent>

      {/* Maintenance Tab */}
      <TabsContent
        value="maintenance"
        className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed flex items-center justify-center">
          <div className="text-center">
            <IconFileText className="mx-auto size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Maintenance requests will be displayed here</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Generic Data Table Component
function DataTableComponent({ data, columns }) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [columnFilters, setColumnFilters] = React.useState([])
  const [sorting, setSorting] = React.useState([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Filter records..."
          value={(table.getColumn("propertyName")?.getFilterValue() ?? "") || 
                 (table.getColumn("name")?.getFilterValue() ?? "") ||
                 (table.getColumn("reference")?.getFilterValue() ?? "")}
          onChange={(event) => {
            const value = event.target.value
            // Try to set filter on different columns based on what exists
            table.getColumn("propertyName")?.setFilterValue(value) ||
            table.getColumn("name")?.setFilterValue(value) ||
            table.getColumn("reference")?.setFilterValue(value)
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconLayoutColumns />
              <span className="hidden lg:inline">Columns</span>
              <IconChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter((column) =>
              typeof column.accessorFn !== "undefined" &&
              column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination table={table} />
    </>
  )
}

// Pagination Component
function TablePagination({ table }) {
  return (
    <div className="flex items-center justify-between px-4">
      <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            Rows per page
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}>
            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Go to first page</span>
            <IconChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Go to previous page</span>
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            <span className="sr-only">Go to next page</span>
            <IconChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}>
            <span className="sr-only">Go to last page</span>
            <IconChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Chart data for property details
const rentChartData = [
  { month: "Jan", amount: 8500 },
  { month: "Feb", amount: 8500 },
  { month: "Mar", amount: 8500 },
  { month: "Apr", amount: 0 },
  { month: "May", amount: 8500 },
  { month: "Jun", amount: 0 },
]

const chartConfig = {
  amount: {
    label: "Rent Amount",
    color: "var(--primary)",
  }
}

// Property Detail Viewer
function PropertyViewer({ item }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          <div className="flex items-center gap-2">
            <IconBuilding className="size-4 text-muted-foreground" />
            {item.propertyName}
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.propertyName}</DrawerTitle>
          <DrawerDescription>
            <div className="flex items-center gap-2">
              <IconMapPin className="size-4" />
              {item.location}
            </div>
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={rentChartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area
                    dataKey="amount"
                    type="natural"
                    fill="var(--color-amount)"
                    fillOpacity={0.6}
                    stroke="var(--color-amount)" />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Rent collection trend{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Payment history for the last 6 months
                </div>
              </div>
              <Separator />
            </>
          )}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="propertyName">Property Name</Label>
              <Input id="propertyName" defaultValue={item.propertyName} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="propertyType">Type</Label>
                <Select defaultValue={item.propertyType}>
                  <SelectTrigger id="propertyType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Occupied">Occupied</SelectItem>
                    <SelectItem value="Vacant">Vacant</SelectItem>
                    <SelectItem value="Maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="rentAmount">Rent Amount (K)</Label>
                <Input id="rentAmount" type="number" defaultValue={item.rentAmount} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" defaultValue={item.dueDate} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="tenant">Current Tenant</Label>
              <Input id="tenant" defaultValue={item.tenant} />
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button>Save Changes</Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// Tenant Detail Viewer  
function TenantViewer({ item }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          <div className="flex items-center gap-2">
            <IconUser className="size-4 text-muted-foreground" />
            {item.name}
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>
            Tenant at {item.property}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="tenantName">Full Name</Label>
              <Input id="tenantName" defaultValue={item.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={item.email} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue={item.phone} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="property">Property</Label>
              <Input id="property" defaultValue={item.property} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="leaseStart">Lease Start</Label>
                <Input id="leaseStart" type="date" defaultValue={item.leaseStart} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="leaseEnd">Lease End</Label>
                <Input id="leaseEnd" type="date" defaultValue={item.leaseEnd} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="rentAmount">Monthly Rent (K)</Label>
                <Input id="rentAmount" type="number" defaultValue={item.rentAmount} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="balance">Current Balance (K)</Label>
                <Input id="balance" type="number" defaultValue={item.balance} />
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button>Save Changes</Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <IconPhone className="mr-2 size-4" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm">
              <IconMail className="mr-2 size-4" />
              Email
            </Button>
          </div>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// Default export with sample data
export default function RealEstateApp() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Real Estate Management</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser.name}. Here's an overview of your properties.
        </p>
      </div>
      <RealEstateDataTable 
        data={propertyData} 
        type="properties"
      />
    </div>
  )
}