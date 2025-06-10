import { mongoose } from '../db/connection.js'

const LeaseSchema = new mongoose.Schema({
  // Basic Lease Information
  leaseRef: {
    type: String,
    unique: true,
    required: [true, 'Lease reference is required'],
    uppercase: true,
    match: [/^LEASE\d{4}[A-Z0-9]{6}$/, 'Invalid lease reference format']
  },
  
  // Parties Involved
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Landlord is required']
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tenant is required']
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property is required']
  },
  
  // Additional Tenants (for joint leases)
  coTenants: [{
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    relationship: {
      type: String,
      enum: ['SPOUSE', 'PARTNER', 'FAMILY', 'FRIEND', 'COLLEAGUE', 'OTHER'],
      default: 'OTHER'
    },
    responsibility: {
      type: String,
      enum: ['JOINT_SEVERALLY', 'INDIVIDUAL', 'GUARANTOR'],
      default: 'JOINT_SEVERALLY'
    }
  }],
  
  // Lease Period
  startDate: {
    type: Date,
    required: [true, 'Lease start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Lease end date is required']
  },
  duration: {
    months: {
      type: Number,
      required: true,
      min: [1, 'Lease duration must be at least 1 month']
    },
    years: {
      type: Number,
      default: 0
    }
  },
  
  // Renewal Options
  renewalOptions: {
    autoRenewal: {
      type: Boolean,
      default: false
    },
    renewalPeriod: {
      type: Number, // in months
      default: 12
    },
    renewalNoticeRequired: {
      type: Number, // days before expiry
      default: 60
    },
    rentIncreaseOnRenewal: {
      type: Number, // percentage
      default: 0
    }
  },
  
  // Financial Terms
  rentDetails: {
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: [0, 'Monthly rent cannot be negative']
    },
    currency: {
      type: String,
      enum: ['ZMW', 'USD'],
      default: 'ZMW'
    },
    deposit: {
      amount: {
        type: Number,
        required: [true, 'Deposit amount is required'],
        min: [0, 'Deposit cannot be negative']
      },
      depositPaid: {
        type: Boolean,
        default: false
      },
      depositPaidDate: Date,
      refundable: {
        type: Boolean,
        default: true
      }
    },
    serviceCharge: {
      type: Number,
      min: [0, 'Service charge cannot be negative'],
      default: 0
    },
    utilitiesIncluded: {
      water: { type: Boolean, default: false },
      electricity: { type: Boolean, default: false },
      internet: { type: Boolean, default: false },
      security: { type: Boolean, default: false },
      garbage: { type: Boolean, default: false }
    },
    additionalCharges: [{
      description: {
        type: String,
        required: true,
        trim: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      frequency: {
        type: String,
        enum: ['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME'],
        default: 'MONTHLY'
      }
    }]
  },
  
  // Payment Terms
  paymentTerms: {
    dueDay: {
      type: Number,
      required: [true, 'Payment due day is required'],
      min: [1, 'Due day must be between 1 and 31'],
      max: [31, 'Due day must be between 1 and 31']
    },
    gracePeriod: {
      type: Number, // days
      default: 5
    },
    lateFee: {
      type: Number,
      default: 0
    },
    lateFeeType: {
      type: String,
      enum: ['FLAT_RATE', 'PERCENTAGE', 'DAILY_COMPOUND'],
      default: 'FLAT_RATE'
    },
    preferredPaymentMethod: {
      type: String,
      enum: [
        'BANK_TRANSFER',
        'CASH',
        'CHEQUE',
        'MTN_MOBILE_MONEY',
        'AIRTEL_MONEY',
        'ZAMTEL_KWACHA',
        'CARD_PAYMENT'
      ],
      default: 'BANK_TRANSFER'
    },
    advancePayment: {
      required: { type: Boolean, default: false },
      months: { type: Number, default: 1 }
    }
  },
  
  // Lease Conditions and Terms
  terms: {
    // Standard lease clauses
    petPolicy: {
      allowed: { type: Boolean, default: false },
      deposit: { type: Number, default: 0 },
      restrictions: [String],
      maxPets: { type: Number, default: 0 }
    },
    smokingPolicy: {
      allowed: { type: Boolean, default: false },
      designatedAreas: [String]
    },
    guestPolicy: {
      maxStayDuration: { type: Number, default: 14 }, // days
      notificationRequired: { type: Boolean, default: true },
      registrationRequired: { type: Boolean, default: false }
    },
    sublettingPolicy: {
      allowed: { type: Boolean, default: false },
      requiresApproval: { type: Boolean, default: true },
      additionalFee: { type: Number, default: 0 }
    },
    alterationsPolicy: {
      allowed: { type: Boolean, default: false },
      requiresApproval: { type: Boolean, default: true },
      restorationRequired: { type: Boolean, default: true }
    },
    businessUse: {
      allowed: { type: Boolean, default: false },
      types: [String],
      additionalFee: { type: Number, default: 0 }
    }
  },
  
  // Maintenance and Repairs
  maintenanceResponsibilities: {
    landlord: [{
      type: String,
      enum: [
        'STRUCTURAL_REPAIRS',
        'ROOF_MAINTENANCE',
        'PLUMBING_MAJOR',
        'ELECTRICAL_MAJOR',
        'HVAC_MAINTENANCE',
        'EXTERIOR_PAINTING',
        'APPLIANCE_MAJOR_REPAIRS',
        'PEST_CONTROL',
        'SECURITY_SYSTEMS'
      ]
    }],
    tenant: [{
      type: String,
      enum: [
        'ROUTINE_CLEANING',
        'MINOR_REPAIRS',
        'GARDEN_MAINTENANCE',
        'INTERIOR_PAINTING',
        'APPLIANCE_CARE',
        'UTILITY_BILLS',
        'PEST_PREVENTION',
        'FIXTURE_REPLACEMENT'
      ]
    }],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  
  // Insurance Requirements
  insurance: {
    tenantInsuranceRequired: {
      type: Boolean,
      default: false
    },
    minimumCoverage: {
      type: Number,
      default: 0
    },
    landlordInsurance: {
      provider: String,
      policyNumber: String,
      coverage: Number
    }
  },
  
  // Special Conditions
  specialConditions: [{
    condition: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: [
        'FINANCIAL',
        'MAINTENANCE',
        'USAGE',
        'TERMINATION',
        'RENEWAL',
        'OTHER'
      ],
      default: 'OTHER'
    },
    negotiable: {
      type: Boolean,
      default: true
    }
  }],
  
  // Lease Status and Lifecycle
  status: {
    type: String,
    enum: [
      'DRAFT',
      'PENDING_APPROVAL',
      'ACTIVE',
      'EXPIRED',
      'TERMINATED',
      'RENEWED',
      'CANCELLED'
    ],
    default: 'DRAFT'
  },
  
  // Termination Information
  terminationInfo: {
    terminatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    terminationDate: Date,
    terminationReason: {
      type: String,
      enum: [
        'NATURAL_EXPIRY',
        'TENANT_REQUEST',
        'LANDLORD_REQUEST',
        'BREACH_OF_CONTRACT',
        'NON_PAYMENT',
        'PROPERTY_SALE',
        'MUTUAL_AGREEMENT',
        'OTHER'
      ]
    },
    noticePeriod: {
      type: Number, // days
      default: 30
    },
    noticeGivenDate: Date,
    penaltyApplied: {
      type: Number,
      default: 0
    }
  },
  
  // Digital Signatures and Approvals
  signatures: {
    landlord: {
      signed: { type: Boolean, default: false },
      signedDate: Date,
      signedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      ipAddress: String,
      digitalSignature: String
    },
    tenant: {
      signed: { type: Boolean, default: false },
      signedDate: Date,
      signedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      ipAddress: String,
      digitalSignature: String
    },
    witness: {
      required: { type: Boolean, default: false },
      name: String,
      idNumber: String,
      signed: { type: Boolean, default: false },
      signedDate: Date
    }
  },
  
  // Document Attachments
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'LEASE_AGREEMENT',
        'TENANT_ID_COPY',
        'INCOME_PROOF',
        'EMPLOYMENT_LETTER',
        'BANK_STATEMENTS',
        'REFERENCES',
        'DEPOSIT_RECEIPT',
        'INVENTORY_LIST',
        'INSPECTION_REPORT',
        'OTHER'
      ],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notification and Reminder Settings
  notifications: {
    renewalReminder: {
      enabled: { type: Boolean, default: true },
      daysBefore: { type: Number, default: 60 }
    },
    expiryReminder: {
      enabled: { type: Boolean, default: true },
      daysBefore: { type: Number, default: 30 }
    },
    paymentReminder: {
      enabled: { type: Boolean, default: true },
      daysBefore: { type: Number, default: 3 }
    }
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better performance

LeaseSchema.index({ landlordId: 1, status: 1 })
LeaseSchema.index({ tenantId: 1, status: 1 })
LeaseSchema.index({ propertyId: 1, status: 1 })
LeaseSchema.index({ startDate: 1, endDate: 1 })
LeaseSchema.index({ status: 1, endDate: 1 })
LeaseSchema.index({ createdAt: -1 })

// Compound indexes
LeaseSchema.index({ propertyId: 1, startDate: 1, endDate: 1 })
LeaseSchema.index({ landlordId: 1, status: 1, endDate: 1 })

// Virtual properties
LeaseSchema.virtual('totalMonthlyPayment').get(function() {
  let total = this.rentDetails.monthlyRent + this.rentDetails.serviceCharge
  
  // Add monthly additional charges
  if (this.rentDetails.additionalCharges) {
    this.rentDetails.additionalCharges.forEach(charge => {
      if (charge.frequency === 'MONTHLY') {
        total += charge.amount
      }
    })
  }
  
  return total
})

LeaseSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'ACTIVE') return 0
  const now = new Date()
  const end = new Date(this.endDate)
  const diffTime = end - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

LeaseSchema.virtual('isExpiringSoon').get(function() {
  return this.daysRemaining <= 60 && this.daysRemaining > 0
})

LeaseSchema.virtual('isExpired').get(function() {
  return new Date() > new Date(this.endDate)
})

LeaseSchema.virtual('isActive').get(function() {
  const now = new Date()
  return this.status === 'ACTIVE' && 
         now >= new Date(this.startDate) && 
         now <= new Date(this.endDate)
})

// Pre-save middleware
LeaseSchema.pre('save', function(next) {
  // Calculate duration in months and years
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate)
    const end = new Date(this.endDate)
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth())
    
    this.duration.months = months
    this.duration.years = Math.floor(months / 12)
  }
  
  // Validate dates
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'))
    return
  }
  
  // Validate that property is not already leased for overlapping period
  if (this.isNew || this.isModified('startDate') || this.isModified('endDate')) {
    // This validation would be done in the route handler to avoid async issues
  }
  
  next()
})

// Instance methods
LeaseSchema.methods.isFullySigned = function() {
  return this.signatures.landlord.signed && this.signatures.tenant.signed &&
         (!this.signatures.witness.required || this.signatures.witness.signed)
}

LeaseSchema.methods.canBeActivated = function() {
  return this.status === 'PENDING_APPROVAL' && 
         this.isFullySigned() &&
         this.rentDetails.deposit.depositPaid
}

LeaseSchema.methods.activate = async function() {
  if (!this.canBeActivated()) {
    throw new Error('Lease cannot be activated. Check signatures and deposit payment.')
  }
  
  this.status = 'ACTIVE'
  
  // Update property status to occupied
  const Property = mongoose.model('Property')
  await Property.findByIdAndUpdate(this.propertyId, { 
    status: 'OCCUPIED' 
  })
  
  return await this.save()
}

LeaseSchema.methods.terminate = async function(terminatedBy, reason, terminationDate = new Date()) {
  this.status = 'TERMINATED'
  this.terminationInfo.terminatedBy = terminatedBy
  this.terminationInfo.terminationReason = reason
  this.terminationInfo.terminationDate = terminationDate
  
  // Update property status to available
  const Property = mongoose.model('Property')
  await Property.findByIdAndUpdate(this.propertyId, { 
    status: 'AVAILABLE' 
  })
  
  return await this.save()
}

LeaseSchema.methods.renew = async function(newEndDate, rentIncrease = 0) {
  // Create a new lease based on current one
  const LeaseModel = this.constructor
  
  const newLease = new LeaseModel({
    ...this.toObject(),
    _id: undefined,
    leaseRef: undefined, // Will be generated
    startDate: this.endDate,
    endDate: newEndDate,
    rentDetails: {
      ...this.rentDetails,
      monthlyRent: this.rentDetails.monthlyRent * (1 + rentIncrease / 100)
    },
    status: 'DRAFT',
    signatures: {
      landlord: { signed: false },
      tenant: { signed: false },
      witness: { required: false }
    },
    createdAt: undefined,
    updatedAt: undefined
  })
  
  // Mark current lease as renewed
  this.status = 'RENEWED'
  await this.save()
  
  return await newLease.save()
}

LeaseSchema.methods.calculateProRatedRent = function(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const daysInPeriod = (end - start) / (1000 * 60 * 60 * 24)
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
  
  return (this.rentDetails.monthlyRent / daysInMonth) * daysInPeriod
}

LeaseSchema.methods.getUpcomingPayments = function(months = 3) {
  const payments = []
  const currentDate = new Date()
  
  for (let i = 0; i < months; i++) {
    const paymentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, this.paymentTerms.dueDay)
    
    if (paymentDate >= new Date(this.startDate) && paymentDate <= new Date(this.endDate)) {
      payments.push({
        dueDate: paymentDate,
        amount: this.totalMonthlyPayment,
        description: `Monthly rent for ${paymentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      })
    }
  }
  
  return payments
}

// Static methods
LeaseSchema.statics.findActiveByProperty = function(propertyId) {
  return this.findOne({
    propertyId,
    status: 'ACTIVE',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  })
}

LeaseSchema.statics.findByLandlord = function(landlordId, filters = {}) {
  return this.find({ 
    landlordId, 
    ...filters 
  }).sort({ createdAt: -1 })
}

LeaseSchema.statics.findByTenant = function(tenantId, filters = {}) {
  return this.find({ 
    tenantId, 
    ...filters 
  }).sort({ createdAt: -1 })
}

LeaseSchema.statics.findExpiringSoon = function(days = 60) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  
  return this.find({
    status: 'ACTIVE',
    endDate: {
      $gte: new Date(),
      $lte: futureDate
    }
  }).populate('landlordId tenantId propertyId')
}

LeaseSchema.statics.getLeaseStats = async function(landlordId) {
  const pipeline = [
    { $match: { landlordId: mongoose.Types.ObjectId(landlordId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
        },
        expiring: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'ACTIVE'] },
                  { $lte: ['$endDate', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)] }
                ]
              },
              1,
              0
            ]
          }
        },
        averageRent: { $avg: '$rentDetails.monthlyRent' },
        totalMonthlyRevenue: { $sum: '$rentDetails.monthlyRent' }
      }
    }
  ]
  
  const result = await this.aggregate(pipeline)
  return result[0] || {}
}

export default mongoose.models.Lease || mongoose.model('Lease', LeaseSchema)