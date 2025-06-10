import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import connectDB from './db/connection.js'
import User from './models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const COOKIE_NAME = 'auth-token'

/**
 * Generate JWT token for user
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'zambia-real-estate',
    audience: 'zambia-real-estate-users'
  })
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'zambia-real-estate',
      audience: 'zambia-real-estate-users'
    })
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId) {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

/**
 * Hash password
 */
export async function hashPassword(password) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash)
}

/**
 * Create user session
 */
export function createUserSession(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified
  }

  const token = generateToken(payload)
  const refreshToken = generateRefreshToken(user._id)

  return {
    token,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      lastLogin: user.lastLogin
    },
    expiresIn: JWT_EXPIRES_IN
  }
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(token, response) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  }

  response.cookies.set(COOKIE_NAME, token, cookieOptions)
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(response) {
  response.cookies.delete(COOKIE_NAME)
}

/**
 * Get token from request
 */
export function getTokenFromRequest(request) {
  // Try to get token from cookie first
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value
  if (cookieToken) {
    return cookieToken
  }

  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request) {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    
    // Connect to database and get fresh user data
    await connectDB()
    const user = await User.findById(payload.userId).select('-password')
    
    if (!user || !user.isActive) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email, password) {
  try {
    await connectDB()
    
    const user = await User.authenticate(email, password)
    return createUserSession(user)
  } catch (error) {
    throw new Error(error.message || 'Authentication failed')
  }
}

/**
 * Register new user
 */
export async function registerUser(userData) {
  try {
    await connectDB()
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: userData.email.toLowerCase() 
    })
    
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Check if phone number is already in use
    if (userData.phone) {
      const existingPhone = await User.findOne({ 
        phone: userData.phone 
      })
      
      if (existingPhone) {
        throw new Error('User with this phone number already exists')
      }
    }

    // Create new user
    const user = new User({
      ...userData,
      email: userData.email.toLowerCase(),
      isActive: true
    })

    await user.save()
    
    return createUserSession(user)
  } catch (error) {
    throw new Error(error.message || 'Registration failed')
  }
}

/**
 * Logout user
 */
export async function logoutUser(userId) {
  try {
    await connectDB()
    
    // You could implement token blacklisting here
    // For now, we'll just rely on cookie deletion
    
    return true
  } catch (error) {
    console.error('Error during logout:', error)
    return false
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const payload = verifyToken(refreshToken)
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid refresh token')
    }

    await connectDB()
    const user = await User.findById(payload.userId).select('-password')
    
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive')
    }

    return createUserSession(user)
  } catch (error) {
    throw new Error('Failed to refresh token')
  }
}

/**
 * Check if user has permission for action
 */
export function hasPermission(userRole, requiredRoles, resourceOwnerId = null, userId = null) {
  // System admin has access to everything
  if (userRole === 'SYSTEM_ADMIN') {
    return true
  }

  // Check if user role is in required roles
  if (!requiredRoles.includes(userRole)) {
    return false
  }

  // For resource-specific access, check ownership
  if (resourceOwnerId && userId) {
    return resourceOwnerId.toString() === userId.toString()
  }

  return true
}

/**
 * Role-based access control middleware
 */
export function requireAuth(allowedRoles = []) {
  return async (request) => {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return {
        error: 'Authentication required',
        status: 401
      }
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        error: 'Insufficient permissions',
        status: 403
      }
    }

    return { user }
  }
}

/**
 * Check if user can access property
 */
export async function canAccessProperty(userId, userRole, propertyId) {
  if (userRole === 'SYSTEM_ADMIN') {
    return true
  }

  await connectDB()
  const Property = await import('./models/Property.js').then(m => m.default)
  
  if (userRole === 'LANDLORD') {
    const property = await Property.findOne({
      _id: propertyId,
      landlordId: userId
    })
    return !!property
  }

  if (userRole === 'TENANT') {
    const Lease = await import('./models/Lease.js').then(m => m.default)
    const lease = await Lease.findOne({
      propertyId,
      tenantId: userId,
      status: 'ACTIVE'
    })
    return !!lease
  }

  if (userRole === 'STAFF') {
    const user = await User.findById(userId)
    if (!user.landlordId) return false
    
    const property = await Property.findOne({
      _id: propertyId,
      landlordId: user.landlordId
    })
    return !!property
  }

  return false
}

/**
 * Check if user can access tenant data
 */
export async function canAccessTenant(userId, userRole, tenantId) {
  if (userRole === 'SYSTEM_ADMIN') {
    return true
  }

  if (userRole === 'TENANT') {
    return userId.toString() === tenantId.toString()
  }

  await connectDB()
  
  if (userRole === 'LANDLORD') {
    const Lease = await import('./models/Lease.js').then(m => m.default)
    const lease = await Lease.findOne({
      landlordId: userId,
      tenantId,
      status: 'ACTIVE'
    })
    return !!lease
  }

  if (userRole === 'STAFF') {
    const user = await User.findById(userId)
    if (!user.landlordId || !user.permissions.canViewTenants) {
      return false
    }
    
    const Lease = await import('./models/Lease.js').then(m => m.default)
    const lease = await Lease.findOne({
      landlordId: user.landlordId,
      tenantId,
      status: 'ACTIVE'
    })
    return !!lease
  }

  return false
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken() {
  return jwt.sign(
    { 
      type: 'email_verification',
      timestamp: Date.now()
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

/**
 * Generate phone verification code
 */
export function generatePhoneVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken() {
  return jwt.sign(
    {
      type: 'password_reset',
      timestamp: Date.now()
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.attempts = new Map()
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier) {
    const now = Date.now()
    const userAttempts = this.attempts.get(identifier) || { count: 0, resetTime: now + this.windowMs }

    if (now > userAttempts.resetTime) {
      userAttempts.count = 0
      userAttempts.resetTime = now + this.windowMs
    }

    if (userAttempts.count >= this.maxAttempts) {
      return false
    }

    userAttempts.count++
    this.attempts.set(identifier, userAttempts)
    return true
  }

  getRemainingAttempts(identifier) {
    const userAttempts = this.attempts.get(identifier)
    if (!userAttempts) return this.maxAttempts
    
    const now = Date.now()
    if (now > userAttempts.resetTime) {
      return this.maxAttempts
    }
    
    return Math.max(0, this.maxAttempts - userAttempts.count)
  }

  getResetTime(identifier) {
    const userAttempts = this.attempts.get(identifier)
    if (!userAttempts) return null
    
    const now = Date.now()
    if (now > userAttempts.resetTime) {
      return null
    }
    
    return new Date(userAttempts.resetTime)
  }
}

// Create rate limiter instances
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
export const registrationRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 attempts per hour

/**
 * Generate secure random string
 */
export function generateSecureRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000) // Limit length
}

/**
 * Log security events
 */
export function logSecurityEvent(event, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: details.ip || 'unknown',
    userAgent: details.userAgent || 'unknown'
  }
  
  // In production, you would send this to a security logging service
  console.log('SECURITY_EVENT:', logEntry)
}

export default {
  generateToken,
  verifyToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
  createUserSession,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
  getCurrentUser,
  authenticateUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  hasPermission,
  requireAuth,
  canAccessProperty,
  canAccessTenant,
  generateEmailVerificationToken,
  generatePhoneVerificationCode,
  generatePasswordResetToken,
  validatePassword,
  RateLimiter,
  loginRateLimiter,
  registrationRateLimiter,
  generateSecureRandomString,
  sanitizeInput,
  logSecurityEvent
}