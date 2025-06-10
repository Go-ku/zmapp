import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Define protected routes and their required roles
const protectedRoutes = {
  // Admin only routes
  '/dashboard/admin': ['SYSTEM_ADMIN'],
  '/api/admin': ['SYSTEM_ADMIN'],
  
  // Landlord routes
  '/dashboard/landlord': ['LANDLORD', 'SYSTEM_ADMIN'],
  '/properties/new': ['LANDLORD', 'SYSTEM_ADMIN'],
  '/properties/[id]/edit': ['LANDLORD', 'SYSTEM_ADMIN'],
  
  // Tenant routes
  '/dashboard/tenant': ['TENANT', 'SYSTEM_ADMIN'],
  '/tenant': ['TENANT', 'SYSTEM_ADMIN'],
  
  // Staff routes
  '/dashboard/staff': ['STAFF', 'LANDLORD', 'SYSTEM_ADMIN'],
  '/staff': ['STAFF', 'LANDLORD', 'SYSTEM_ADMIN'],
  
  // General authenticated routes
  '/dashboard': ['SYSTEM_ADMIN', 'LANDLORD', 'TENANT', 'STAFF'],
  '/properties': ['SYSTEM_ADMIN', 'LANDLORD', 'STAFF'],
  '/payments': ['SYSTEM_ADMIN', 'LANDLORD', 'TENANT', 'STAFF'],
  '/maintenance': ['SYSTEM_ADMIN', 'LANDLORD', 'TENANT', 'STAFF'],
  '/tenants': ['SYSTEM_ADMIN', 'LANDLORD', 'STAFF'],
  '/settings': ['SYSTEM_ADMIN', 'LANDLORD', 'TENANT', 'STAFF'],
  '/reports': ['SYSTEM_ADMIN', 'LANDLORD'],
  '/api/properties': ['SYSTEM_ADMIN', 'LANDLORD', 'STAFF'],
  '/api/payments': ['SYSTEM_ADMIN', 'LANDLORD', 'TENANT', 'STAFF'],
  '/api/maintenance': ['SYSTEM_ADMIN', 'LANDLORD', 'TENANT', 'STAFF'],
  '/api/tenants': ['SYSTEM_ADMIN', 'LANDLORD', 'STAFF'],
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/health',
]

// Routes that redirect based on user role
const roleBasedRedirects = {
  SYSTEM_ADMIN: '/dashboard/admin',
  LANDLORD: '/dashboard/landlord',
  TENANT: '/dashboard/tenant',
  STAFF: '/dashboard/staff',
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')
    const { payload } = await jwtVerify(token, secret)
    
    const userRole = payload.role
    const userId = payload.userId

    // Handle dashboard redirect based on role
    if (pathname === '/dashboard') {
      const redirectPath = roleBasedRedirects[userRole] || '/dashboard/tenant'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }

    // Check role-based access for protected routes
    const matchedRoute = Object.keys(protectedRoutes).find(route => {
      // Handle dynamic routes like [id]
      const routePattern = route.replace(/\[.*?\]/g, '[^/]+')
      const regex = new RegExp(`^${routePattern}`)
      return regex.test(pathname)
    })

    if (matchedRoute) {
      const allowedRoles = protectedRoutes[matchedRoute]
      
      if (!allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard if user doesn't have access
        const userDashboard = roleBasedRedirects[userRole] || '/dashboard/tenant'
        return NextResponse.redirect(new URL(userDashboard, request.url))
      }
    }

    // For API routes, add user info to headers
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', userId)
      requestHeaders.set('x-user-role', userRole)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    // Handle property access control for landlords
    if (userRole === 'LANDLORD' && pathname.match(/\/properties\/\d+/)) {
      // Add property ownership check here if needed
      // This would require a database call to verify the landlord owns the property
    }

    // Handle tenant access control
    if (userRole === 'TENANT' && pathname.match(/\/tenant/)) {
      // Add tenant-specific access control here if needed
    }

    return NextResponse.next()

  } catch (error) {
    console.error('Middleware error:', error)
    
    // Invalid token, redirect to login
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    loginUrl.searchParams.set('error', 'session-expired')
    
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('auth-token')
    
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}