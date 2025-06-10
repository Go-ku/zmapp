import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with tailwind-merge for better className handling
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency for Zambian context
 */
export function formatCurrency(amount, currency = 'ZMW') {
  const formatters = {
    ZMW: new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2,
    }),
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }),
  }

  return formatters[currency]?.format(amount) || `${currency} ${amount}`
}

/**
 * Format date for Zambian context
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    timeZone: 'Africa/Lusaka',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }

  return new Intl.DateTimeFormat('en-ZM', defaultOptions).format(new Date(date))
}

/**
 * Format date and time
 */
export function formatDateTime(date) {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(date) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = (target - now) / 1000

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds)
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, interval.label)
    }
  }

  return 'just now'
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert text to title case
 */
export function toTitleCase(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Generate initials from name
 */
export function getInitials(name) {
  if (!name) return 'UN'
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/**
 * Validate email address
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Zambian phone number
 */
export function isValidZambianPhone(phone) {
  // Zambian phone numbers: +260 followed by 9 digits
  const phoneRegex = /^(\+260|0)?[7-9]\d{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Format Zambian phone number
 */
export function formatZambianPhone(phone) {
  if (!phone) return ''
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Handle different formats
  if (cleaned.startsWith('260')) {
    // +260 format
    const number = cleaned.slice(3)
    return `+260 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`
  } else if (cleaned.startsWith('0')) {
    // 0 format
    const number = cleaned.slice(1)
    return `+260 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`
  } else if (cleaned.length === 9) {
    // 9 digits format
    return `+260 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`
  }
  
  return phone
}

/**
 * Generate unique ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}

/**
 * Generate property reference number
 */
export function generatePropertyRef() {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `PROP${year}${random}`
}

/**
 * Generate payment reference number
 */
export function generatePaymentRef() {
  const year = new Date().getFullYear()
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `PAY${year}${month}${random}`
}

/**
 * Generate lease reference number
 */
export function generateLeaseRef() {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `LEASE${year}${random}`
}

/**
 * Calculate rent amount based on property and lease terms
 */
export function calculateRent(baseAmount, terms = {}) {
  let amount = parseFloat(baseAmount) || 0
  
  // Apply discounts
  if (terms.discount) {
    amount -= (amount * terms.discount / 100)
  }
  
  // Apply taxes
  if (terms.tax) {
    amount += (amount * terms.tax / 100)
  }
  
  // Apply service charges
  if (terms.serviceCharge) {
    amount += parseFloat(terms.serviceCharge) || 0
  }
  
  return Math.round(amount * 100) / 100 // Round to 2 decimal places
}

/**
 * Check if payment is overdue
 */
export function isPaymentOverdue(dueDate) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

/**
 * Calculate days overdue
 */
export function getDaysOverdue(dueDate) {
  if (!dueDate) return 0
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = now - due
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

/**
 * Get payment status
 */
export function getPaymentStatus(payment) {
  if (!payment) return 'unknown'
  
  if (payment.status === 'paid') return 'paid'
  if (payment.status === 'pending') return 'pending'
  if (payment.status === 'rejected') return 'rejected'
  if (payment.status === 'approved' && payment.amount >= payment.expectedAmount) return 'paid'
  if (payment.status === 'approved' && payment.amount < payment.expectedAmount) return 'partial'
  
  if (isPaymentOverdue(payment.dueDate)) return 'overdue'
  
  return 'pending'
}

/**
 * Get property status color
 */
export function getStatusColor(status) {
  const colors = {
    available: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    occupied: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    maintenance: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
    pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
    overdue: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
    paid: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    partial: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
    rejected: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  }
  
  return colors[status?.toLowerCase()] || colors.pending
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(1)
  
  return `${size} ${sizes[i]}`
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Check if object is empty
 */
export function isEmpty(obj) {
  if (!obj) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * Sleep function for delays
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Basic sanitize user input (backward compatibility)
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000) // Limit length
}

/**
 * Advanced input sanitization with multiple options
 */
export function sanitizeInputs(input, options = {}) {
  const defaultOptions = {
    trim: true,
    removeHtml: true,
    removeSpecialChars: false,
    maxLength: 1000,
    allowedChars: null,
    toLowerCase: false,
    toUpperCase: false,
    removeNumbers: false,
    preserveSpaces: true,
    removeEmojis: false,
    sanitizeEmail: false,
    sanitizePhone: false,
    sanitizeZambianPhone: false,
    preventXSS: true,
    preventSQLInjection: true
  }

  const opts = { ...defaultOptions, ...options }

  // Handle non-string inputs
  if (input === null || input === undefined) {
    return input
  }

  if (typeof input === 'number' || typeof input === 'boolean') {
    return input
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInputs(item, options))
  }

  if (typeof input === 'object') {
    const sanitized = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInputs(key, { ...opts, maxLength: 100 })] = sanitizeInputs(value, options)
    }
    return sanitized
  }

  if (typeof input !== 'string') {
    return String(input)
  }

  let sanitized = input

  // Trim whitespace
  if (opts.trim) {
    sanitized = sanitized.trim()
  }

  // Convert case
  if (opts.toLowerCase) {
    sanitized = sanitized.toLowerCase()
  }
  if (opts.toUpperCase) {
    sanitized = sanitized.toUpperCase()
  }

  // Remove HTML tags and entities
  if (opts.removeHtml) {
    sanitized = sanitized
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, '') // Remove HTML entities
  }

  // Prevent XSS attacks
  if (opts.preventXSS) {
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
  }

  // Prevent SQL injection patterns
  if (opts.preventSQLInjection) {
    sanitized = sanitized
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '')
      .replace(/['"`;\\]/g, '') // Remove quotes and escape characters
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment start
      .replace(/\*\//g, '') // Remove block comment end
  }

  // Remove special characters
  if (opts.removeSpecialChars) {
    sanitized = sanitized.replace(/[^\w\s.-]/g, '')
  }

  // Remove numbers
  if (opts.removeNumbers) {
    sanitized = sanitized.replace(/\d/g, '')
  }

  // Remove or preserve spaces
  if (!opts.preserveSpaces) {
    sanitized = sanitized.replace(/\s+/g, '')
  } else {
    // Normalize multiple spaces to single space
    sanitized = sanitized.replace(/\s+/g, ' ')
  }

  // Remove emojis
  if (opts.removeEmojis) {
    sanitized = sanitized.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
  }

  // Allow only specific characters
  if (opts.allowedChars) {
    const regex = new RegExp(`[^${opts.allowedChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g')
    sanitized = sanitized.replace(regex, '')
  }

  // Email-specific sanitization
  if (opts.sanitizeEmail) {
    sanitized = sanitized
      .toLowerCase()
      .replace(/[^a-z0-9@._-]/g, '')
      .replace(/\.{2,}/g, '.') // Remove multiple consecutive dots
      .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
  }

  // Phone number sanitization
  if (opts.sanitizePhone) {
    sanitized = sanitized.replace(/[^\d+\-\s()]/g, '')
  }

  // Zambian phone number specific sanitization
  if (opts.sanitizeZambianPhone) {
    // Allow only digits, +, spaces, and hyphens
    sanitized = sanitized.replace(/[^\d+\-\s]/g, '')
    
    // Normalize Zambian phone format
    const cleaned = sanitized.replace(/\D/g, '')
    
    if (cleaned.startsWith('260')) {
      // Format: +260 XX XXX XXXX
      const number = cleaned.slice(3)
      if (number.length === 9) {
        sanitized = `+260 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`
      }
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      // Format: 0XX XXX XXXX to +260 XX XXX XXXX
      const number = cleaned.slice(1)
      sanitized = `+260 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`
    } else if (cleaned.length === 9) {
      // Format: XXXXXXXXX to +260 XX XXX XXXX
      sanitized = `+260 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`
    }
  }

  // Limit length
  if (opts.maxLength && sanitized.length > opts.maxLength) {
    sanitized = sanitized.slice(0, opts.maxLength)
  }

  return sanitized
}

/**
 * Sanitize specific data types with predefined rules
 */
export const sanitizers = {
  // Personal information
  name: (input) => sanitizeInputs(input, {
    removeNumbers: true,
    removeSpecialChars: true,
    maxLength: 50,
    allowedChars: 'a-zA-Z\\s\\-\\.'
  }),

  email: (input) => sanitizeInputs(input, {
    sanitizeEmail: true,
    maxLength: 100,
    toLowerCase: true
  }),

  zambianPhone: (input) => sanitizeInputs(input, {
    sanitizeZambianPhone: true,
    maxLength: 20
  }),

  // Address fields
  address: (input) => sanitizeInputs(input, {
    maxLength: 200,
    allowedChars: 'a-zA-Z0-9\\s\\-\\.,#/'
  }),

  // Property information
  propertyTitle: (input) => sanitizeInputs(input, {
    maxLength: 200,
    allowedChars: 'a-zA-Z0-9\\s\\-\\.,()&'
  }),

  propertyDescription: (input) => sanitizeInputs(input, {
    maxLength: 2000,
    removeHtml: true,
    preventXSS: true
  }),

  // Financial data
  amount: (input) => {
    const sanitized = sanitizeInputs(input, {
      allowedChars: '0-9\\.',
      maxLength: 15
    })
    return parseFloat(sanitized) || 0
  },

  currency: (input) => sanitizeInputs(input, {
    toUpperCase: true,
    allowedChars: 'A-Z',
    maxLength: 3
  }),

  // Business information
  businessName: (input) => sanitizeInputs(input, {
    maxLength: 100,
    allowedChars: 'a-zA-Z0-9\\s\\-\\.,()&'
  }),

  taxNumber: (input) => sanitizeInputs(input, {
    toUpperCase: true,
    allowedChars: 'A-Z0-9\\-',
    maxLength: 20
  }),

  // Identifiers
  nationalId: (input) => sanitizeInputs(input, {
    allowedChars: '0-9/',
    maxLength: 12
  }),

  // Text content
  comment: (input) => sanitizeInputs(input, {
    maxLength: 1000,
    removeHtml: true,
    preventXSS: true,
    preventSQLInjection: true
  }),

  // Search queries
  searchQuery: (input) => sanitizeInputs(input, {
    maxLength: 100,
    removeHtml: true,
    preventXSS: true,
    preventSQLInjection: true,
    allowedChars: 'a-zA-Z0-9\\s\\-'
  })
}

/**
 * Bulk sanitize an object with field-specific rules
 */
export function sanitizeFormData(data, fieldRules = {}) {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sanitized = {}

  for (const [field, value] of Object.entries(data)) {
    if (fieldRules[field]) {
      // Use specific sanitizer
      if (typeof fieldRules[field] === 'function') {
        sanitized[field] = fieldRules[field](value)
      } else if (typeof fieldRules[field] === 'object') {
        sanitized[field] = sanitizeInputs(value, fieldRules[field])
      } else if (typeof fieldRules[field] === 'string' && sanitizers[fieldRules[field]]) {
        sanitized[field] = sanitizers[fieldRules[field]](value)
      } else {
        sanitized[field] = sanitizeInputs(value)
      }
    } else {
      // Default sanitization
      sanitized[field] = sanitizeInputs(value)
    }
  }

  return sanitized
}

/**
 * Validate and sanitize Zambian-specific data
 */
export function sanitizeZambianData(data) {
  const rules = {
    firstName: 'name',
    lastName: 'name',
    email: 'email',
    phone: 'zambianPhone',
    whatsappNumber: 'zambianPhone',
    nationalId: 'nationalId',
    businessName: 'businessName',
    taxNumber: 'taxNumber',
    'address.street': 'address',
    'address.area': 'address',
    'address.city': 'address',
    propertyTitle: 'propertyTitle',
    propertyDescription: 'propertyDescription',
    rentAmount: 'amount',
    currency: 'currency'
  }

  return sanitizeFormData(data, rules)
}

/**
 * Remove dangerous file path characters
 */
export function sanitizeFileName(fileName) {
  if (typeof fileName !== 'string') return 'file'
  
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove dangerous path characters
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .slice(0, 255) // Limit length for filesystem compatibility
    || 'file' // Fallback if empty
}

/**
 * Sanitize URL to prevent open redirects
 */
export function sanitizeUrl(url, allowedDomains = []) {
  if (typeof url !== 'string') return '/'
  
  // Remove dangerous protocols
  const cleaned = url.replace(/^(javascript|data|vbscript):/i, '')
  
  // If it's a relative URL, it's safe
  if (cleaned.startsWith('/') && !cleaned.startsWith('//')) {
    return cleaned
  }
  
  // If allowedDomains specified, check domain
  if (allowedDomains.length > 0) {
    try {
      const urlObj = new URL(cleaned)
      const isAllowed = allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      )
      return isAllowed ? cleaned : '/'
    } catch {
      return '/'
    }
  }
  
  // Default: only allow relative URLs
  return '/'
}