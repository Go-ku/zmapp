import { mongoose } from '../db/connection.js'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Contact Information
  // In your User model (lib/models/User.js), update phone validation:
phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(phone) {
        // Remove spaces and check against Zambian phone pattern
        const cleanPhone = phone.replace(/\s/g, '')
        return /^(\+260|0)?[7-9]\d{8}$/.test(cleanPhone)
      },
      message: 'Please enter a valid Zambian phone number'
    }
  },
  whatsappNumber: {
    type: String,
  
    validate: {
      validator: function(phone) {
        // Remove spaces and check against Zambian phone pattern
        const cleanPhone = phone.replace(/\s/g, '')
        return /^(\+260|0)?[7-9]\d{8}$/.test(cleanPhone)
      },
      message: 'Please enter a valid whatsapp number'
    }
  },
  
  // Address Information
  address: {
    street: { type: String, trim: true },
    area: { type: String, trim: true },
    city: { 
      type: String, 
      trim: true,
      default: 'Lusaka'
    },
    province: {
      type: String,
      enum: [
        'Central Province',
        'Copperbelt Province', 
        'Eastern Province',
        'Luapula Province',
        'Lusaka Province',
        'Muchinga Province',
        'Northern Province',
        'North-Western Province',
        'Southern Province',
        'Western Province'
      ],
      default: 'Lusaka Province'
    },
    postalCode: { type: String, trim: true }
  },
  
  // User Role and Permissions
  role: {
    type: String,
    enum: ['SYSTEM_ADMIN', 'LANDLORD', 'TENANT', 'STAFF'],
    required: [true, 'User role is required'],
    default: 'TENANT'
  },
  
  // For STAFF: Which landlord they work for
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'STAFF'
    }
  },
  
  // Staff permissions (for STAFF role)
  permissions: {
    canLogPayments: { type: Boolean, default: false },
    canIssueReceipts: { type: Boolean, default: false },
    canViewTenants: { type: Boolean, default: false },
    canHandleMaintenance: { type: Boolean, default: false },
    canGenerateReports: { type: Boolean, default: false }
  },
  
  // Profile Information
  avatar: {
    type: String, // URL to profile image
    default: null
  },
  dateOfBirth: {
    type: Date
  },
  nationalId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
    match: [/^\d{9}\/\d{2}\/\d{1}$/, 'Please enter a valid Zambian National ID (format: 123456789/12/1)']
  },
  
  // Business Information (for LANDLORD)
  businessInfo: {
    businessName: { type: String, trim: true },
    businessRegistration: { type: String, trim: true },
    taxNumber: { type: String, trim: true },
    businessPhone: { type: String, trim: true },
    businessEmail: { type: String, lowercase: true, trim: true }
  },
  
  // Bank Account Information
  bankDetails: {
    bankName: {
      type: String,
      enum: [
        'Zanaco',
        'Standard Chartered Bank Zambia',
        'Barclays Bank Zambia',
        'First National Bank Zambia',
        'Stanbic Bank Zambia',
        'Indo Zambia Bank',
        'Access Bank Zambia',
        'Atlas Mara Bank Zambia',
        'Cavmont Bank',
        'Finance Bank Zambia',
        'Other'
      ]
    },
    accountName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    branchCode: { type: String, trim: true }
  },
  
  // Mobile Money Information
  mobileMoneyAccounts: [{
    provider: {
      type: String,
      enum: ['MTN_MOBILE_MONEY', 'AIRTEL_MONEY', 'ZAMTEL_KWACHA'],
      required: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
          validator: function(phone) {
            // Remove spaces and check against Zambian phone pattern
            const cleanPhone = phone.replace(/\s/g, '')
            return /^(\+260|0)?[7-9]\d{8}$/.test(cleanPhone)
          },
          message: 'Please enter a valid phone number'
        }
    },
    accountName: { type: String, trim: true },
    isDefault: { type: Boolean, default: false }
  }],
  
  // Notification Preferences
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    
    // Specific notification types
    paymentReminders: { type: Boolean, default: true },
    leaseExpiry: { type: Boolean, default: true },
    maintenanceUpdates: { type: Boolean, default: true },
    systemAnnouncements: { type: Boolean, default: true }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Security
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Two-Factor Authentication
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  // Login tracking
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password
      delete ret.twoFactorSecret
      delete ret.emailVerificationToken
      delete ret.phoneVerificationCode
      delete ret.passwordResetToken
      return ret
    }
  },
  toObject: { virtuals: true }
})

// Indexes for better performance
UserSchema.index({ role: 1, isActive: 1 })
UserSchema.index({ landlordId: 1, role: 1 })
UserSchema.index({ 'address.province': 1, 'address.city': 1 })
UserSchema.index({ createdAt: -1 })

// Compound index for staff lookup
UserSchema.index({ role: 1, landlordId: 1 })

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Virtual for initials
UserSchema.virtual('initials').get(function() {
  return `${this.firstName?.charAt(0) || ''}${this.lastName?.charAt(0) || ''}`.toUpperCase()
})

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12)
    this.password = hashedPassword
    next()
  } catch (error) {
    next(error)
  }
})

// Pre-save middleware to format phone numbers
UserSchema.pre('save', function(next) {
  // Format main phone number
  if (this.phone) {
    this.phone = this.formatZambianPhone(this.phone)
  }
  
  // Format WhatsApp number
  if (this.whatsappNumber) {
    this.whatsappNumber = this.formatZambianPhone(this.whatsappNumber)
  }
  
  // Format mobile money phone numbers
  if (this.mobileMoneyAccounts) {
    this.mobileMoneyAccounts.forEach(account => {
      if (account.phoneNumber) {
        account.phoneNumber = this.formatZambianPhone(account.phoneNumber)
      }
    })
  }
  
  next()
})

// Method to format Zambian phone numbers
UserSchema.methods.formatZambianPhone = function(phone) {
  if (!phone) return ''
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Handle different formats
  if (cleaned.startsWith('260')) {
    return `+${cleaned}`
  } else if (cleaned.startsWith('0')) {
    return `+260${cleaned.slice(1)}`
  } else if (cleaned.length === 9) {
    return `+260${cleaned}`
  }
  
  return phone
}

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Error comparing passwords')
  }
}

// Method to increment login attempts
UserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    })
  }
  
  const updates = { $inc: { loginAttempts: 1 } }
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 } // 2 hours
  }
  
  return this.updateOne(updates)
}

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  })
}

// Method to check if user can perform action based on role and permissions
UserSchema.methods.canPerform = function(action, resourceOwnerId = null) {
  // System admin can do everything
  if (this.role === 'SYSTEM_ADMIN') return true
  
  // Landlord can manage their own properties and tenants
  if (this.role === 'LANDLORD') {
    if (!resourceOwnerId) return true
    return this._id.toString() === resourceOwnerId.toString()
  }
  
  // Staff permissions based on landlord settings
  if (this.role === 'STAFF') {
    const permissionMap = {
      'log_payments': this.permissions.canLogPayments,
      'issue_receipts': this.permissions.canIssueReceipts,
      'view_tenants': this.permissions.canViewTenants,
      'handle_maintenance': this.permissions.canHandleMaintenance,
      'generate_reports': this.permissions.canGenerateReports
    }
    
    return permissionMap[action] || false
  }
  
  // Tenant can only access their own data
  if (this.role === 'TENANT') {
    if (!resourceOwnerId) return false
    return this._id.toString() === resourceOwnerId.toString()
  }
  
  return false
}

// Method to get user's properties (for landlords)
UserSchema.methods.getProperties = function() {
  if (this.role !== 'LANDLORD') return []
  
  const Property = mongoose.model('Property')
  return Property.find({ landlordId: this._id })
}

// Method to get user's current lease (for tenants)
UserSchema.methods.getCurrentLease = function() {
  if (this.role !== 'TENANT') return null
  
  const Lease = mongoose.model('Lease')
  return Lease.findOne({ 
    tenantId: this._id, 
    status: 'ACTIVE',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  }).populate('propertyId')
}

// Static method to find users by role
UserSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true })
}
// static method to get statistics
 UserSchema.statics.getSystemStats = async function(dateFilter) {
    const stats = await this.aggregate([
      {
        $facet: {
          byRole: [
            { $group: { _id: "$role", count: { $sum: 1 } } }
          ],
          newThisMonth: [
            {
              $match: { createdAt: { $gte: dateFilter.start } }
            },
            { $group: { _id: "$role", count: { $sum: 1 } } }
          ]
        }
      }
    ])

    const result = stats[0]
    const roleCounts = result.byRole.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    const newCounts = result.newThisMonth.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    return {
      landlords: roleCounts.landlord || 0,
      tenants: roleCounts.tenant || 0,
      admins: roleCounts.admin || 0,
      newThisMonth: Object.values(newCounts).reduce((sum, count) => sum + count, 0),
      tenantGrowth: ((newCounts.tenant || 0) / (roleCounts.tenant || 1)) * 100
    }
  }
// Static method to find staff by landlord
UserSchema.statics.findStaffByLandlord = function(landlordId) {
  return this.find({ 
    role: 'STAFF', 
    landlordId, 
    isActive: true 
  })
}

// Static method to authenticate user
UserSchema.statics.authenticate = async function(email, password) {
  const user = await this.findOne({ 
    email: email.toLowerCase(), 
    isActive: true 
  })
  
  if (!user) {
    throw new Error('User not found')
  }
  
  // Check if account is locked
  if (user.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts')
  }
  
  // Check password
  const isMatch = await user.comparePassword(password)
  
  if (!isMatch) {
    await user.incLoginAttempts()
    throw new Error('Invalid email or password')
  }
  
  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts()
  }
  
  // Update last login
  user.lastLogin = new Date()
  await user.save()
  
  return user
}

// Export the model
export default mongoose.models.User || mongoose.model('User', UserSchema)