import { NextResponse } from 'next/server'
import { registerUser, setAuthCookie, registrationRateLimiter, validatePassword, logSecurityEvent } from '@/lib/auth'
import { sanitizeInput, isValidEmail, isValidZambianPhone } from '@/lib/utils'

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
      role,
      address,
      landlordId, // For staff registration
      acceptTerms
    } = body

    // Input validation
    const errors = []

    if (!firstName || firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long')
    }

    if (!lastName || lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long')
    }

    if (!email || !isValidEmail(email)) {
      errors.push('Please provide a valid email address')
    }

    if (!password) {
      errors.push('Password is required')
    } else {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors)
      }
    }

    if (password !== confirmPassword) {
      errors.push('Passwords do not match')
    }

    if (!phone || !isValidZambianPhone(phone)) {
      errors.push('Please provide a valid Zambian phone number')
    }

    if (!role || !['LANDLORD', 'TENANT', 'STAFF'].includes(role)) {
      errors.push('Please select a valid user role')
    }

    if (role === 'STAFF' && !landlordId) {
      errors.push('Landlord is required for staff registration')
    }

    if (!acceptTerms) {
      errors.push('You must accept the terms and conditions')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedData = {
      firstName: sanitizeInput(firstName).trim(),
      lastName: sanitizeInput(lastName).trim(),
      email: sanitizeInput(email).toLowerCase(),
      password,
      phone: sanitizeInput(phone).trim(),
      role,
      address: address ? {
        street: sanitizeInput(address.street || ''),
        area: sanitizeInput(address.area || ''),
        city: sanitizeInput(address.city || 'Lusaka'),
        province: address.province || 'Lusaka Province',
        postalCode: sanitizeInput(address.postalCode || '')
      } : {},
      landlordId: role === 'STAFF' ? landlordId : undefined
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Rate limiting
    if (!registrationRateLimiter.isAllowed(clientIP)) {
      logSecurityEvent('REGISTRATION_RATE_LIMITED', {
        email: sanitizedData.email,
        ip: clientIP,
        userAgent: request.headers.get('user-agent')
      })

      return NextResponse.json(
        { 
          error: 'Too many registration attempts. Please try again later.',
          resetTime: registrationRateLimiter.getResetTime(clientIP)
        },
        { status: 429 }
      )
    }

    // Register user
    try {
      const session = await registerUser(sanitizedData)
      
      // Create response
      const response = NextResponse.json(
        {
          message: 'Registration successful',
          user: session.user,
          expiresIn: session.expiresIn
        },
        { status: 201 }
      )

      // Set authentication cookie
      setAuthCookie(session.token, response)

      // Log successful registration
      logSecurityEvent('REGISTRATION_SUCCESS', {
        userId: session.user.id,
        email: sanitizedData.email,
        role: sanitizedData.role,
        ip: clientIP,
        userAgent: request.headers.get('user-agent')
      })

      return response

    } catch (registerError) {
      // Log failed registration attempt
      logSecurityEvent('REGISTRATION_FAILED', {
        email: sanitizedData.email,
        error: registerError.message,
        ip: clientIP,
        userAgent: request.headers.get('user-agent')
      })

      return NextResponse.json(
        { error: registerError.message },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Registration API error:', error)
    
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200 })
}