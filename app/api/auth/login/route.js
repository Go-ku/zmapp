import { NextResponse } from 'next/server'
import { authenticateUser, setAuthCookie, loginRateLimiter, logSecurityEvent } from '@/lib/auth'
import { sanitizeInput } from '@/lib/utils'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase()
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Rate limiting
    if (!loginRateLimiter.isAllowed(clientIP)) {
      logSecurityEvent('LOGIN_RATE_LIMITED', {
        email: sanitizedEmail,
        ip: clientIP,
        userAgent: request.headers.get('user-agent')
      })

      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          resetTime: loginRateLimiter.getResetTime(clientIP)
        },
        { status: 429 }
      )
    }

    // Authenticate user
    try {
      const session = await authenticateUser(sanitizedEmail, password)
      
      // Create response
      const response = NextResponse.json(
        {
          message: 'Login successful',
          user: session.user,
          expiresIn: session.expiresIn
        },
        { status: 200 }
      )

      // Set authentication cookie
      setAuthCookie(session.token, response)

      // Log successful login
      logSecurityEvent('LOGIN_SUCCESS', {
        userId: session.user.id,
        email: sanitizedEmail,
        role: session.user.role,
        ip: clientIP,
        userAgent: request.headers.get('user-agent')
      })

      return response

    } catch (authError) {
      // Log failed login attempt
      logSecurityEvent('LOGIN_FAILED', {
        email: sanitizedEmail,
        error: authError.message,
        ip: clientIP,
        userAgent: request.headers.get('user-agent')
      })

      return NextResponse.json(
        { 
          error: authError.message,
          remainingAttempts: loginRateLimiter.getRemainingAttempts(clientIP)
        },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Login API error:', error)
    
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200 })
}