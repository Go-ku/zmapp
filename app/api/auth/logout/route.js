import { NextResponse } from 'next/server'
import { getCurrentUser, clearAuthCookie, logoutUser, logSecurityEvent } from '@/lib/auth'

export async function POST(request) {
  try {
    // Get current user
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Perform logout
    await logoutUser(user._id)

    // Create response
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    )

    // Clear authentication cookie
    clearAuthCookie(response)

    // Log successful logout
    logSecurityEvent('LOGOUT_SUCCESS', {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      ip: clientIP,
      userAgent: request.headers.get('user-agent')
    })

    return response

  } catch (error) {
    console.error('Logout API error:', error)
    
    return NextResponse.json(
      { error: 'An unexpected error occurred during logout' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200 })
}