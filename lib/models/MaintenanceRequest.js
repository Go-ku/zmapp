import { mongoose } from '../db/connection.js'

const MaintenanceRequestSchema = new mongoose.Schema({
  // Basic Request Information
  requestRef: {
    type: String,
    unique: true,
    required: [true, 'Maintenance request reference is required'],
    uppercase: true,
    match: [/^MAINT\d{4}[A-Z0-9]{6}$/, 'Invalid maintenance request reference format']
  },
  
  // Parties Involved
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tenant is required']
  },
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Landlord is required']
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property is required']
  },
  
  // Request Details
  title: {
    type: String,
    required: [true, 'Request title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Request description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Categorization
  category: {
    type: String,
    enum: [
      'PLUMBING',
      'ELECTRICAL',
      'HVAC',
      'APPLIANCES',
      'STRUCTURAL',
      'PAINTING',
      'ROOFING',
      'FLOORING',
      'DOORS_WINDOWS',
      'SECURITY',
      'GARDEN_EXTERIOR',
      'CLEANING',
      'PEST_CONTROL',
      'OTHER'
    ],
    required: [true, 'Category is required']
  },
  
  subcategory: {
    type: String,
    trim: true
  },
  
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'EMERGENCY'],
    default: 'MEDIUM'
  },
  
  // Location within property
  location: {
    room: {
      type: String,
      enum: [
        'LIVING_ROOM',
        'KITCHEN',
        'BEDROOM_1',
        'BEDROOM_2',
        'BEDROOM_3',
        'BATHROOM_1',
        'BATHROOM_2',
        'TOILET',
        'BALCONY',
        'GARAGE',
        'GARDEN',
        'STAIRCASE',
        'CORRIDOR',
        'BASEMENT',
        'ATTIC',
        'EXTERIOR',
        'COMMON_AREA',
        'OTHER'
      ]
    },
    specificLocation: {
      type: String,
      trim: true,
      maxlength: [100, 'Specific location cannot exceed 100 characters']
    }
  },
  
  // Request Status and Workflow
  status: {
    type: String,
    enum: [
      'SUBMITTED',
      'ACKNOWLEDGED',
      'IN_REVIEW',
      'APPROVED',
      'ASSIGNED',
      'IN_PROGRESS',
      'COMPLETED',
      'VERIFIED',
      'CLOSED',
      'REJECTED',
      'CANCELLED',
      'ON_HOLD'
    ],
    default: 'SUBMITTED'
  },
  
  // Urgency Assessment
  urgencyAssessment: {
    isEmergency: {
      type: Boolean,
      default: false
    },
    safetyIssue: {
      type: Boolean,
      default: false
    },
    affectsHabitability: {
      type: Boolean,
      default: false
    },
    causingPropertyDamage: {
      type: Boolean,
      default: false
    },
    tenantAtFault: {
      type: Boolean,
      default: false
    }
  },
  
  // Assignment and Contractor Information
  assignment: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Can be staff member or contractor
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date,
    
    contractor: {
      name: {
        type: String,
        trim: true
      },
      company: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
     
        validate: {
          validator: function(phone) {
            // Remove spaces and check against Zambian phone pattern
            const cleanPhone = phone.replace(/\s/g, '')
            return /^(\+260|0)?[7-9]\d{8}$/.test(cleanPhone)
          },
          message: 'Please enter a valid phone number'
        }
      },
      email: {
        type: String,
        lowercase: true,
        trim: true
      },
      specialization: {
        type: String,
        enum: [
          'PLUMBER',
          'ELECTRICIAN',
          'HVAC_TECHNICIAN',
          'CARPENTER',
          'PAINTER',
          'GENERAL_HANDYMAN',
          'ROOFING_SPECIALIST',
          'SECURITY_SPECIALIST',
          'GARDENER',
          'CLEANER',
          'PEST_CONTROL',
          'OTHER'
        ]
      },
      licenseNumber: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    
    estimatedStartDate: Date,
    estimatedCompletionDate: Date,
    actualStartDate: Date,
    actualCompletionDate: Date
  },
  
  // Cost Information
  costEstimate: {
    laborCost: {
      type: Number,
      min: 0,
      default: 0
    },
    materialsCost: {
      type: Number,
      min: 0,
      default: 0
    },
    additionalCosts: {
      type: Number,
      min: 0,
      default: 0
    },
    totalEstimated: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      enum: ['ZMW', 'USD'],
      default: 'ZMW'
    },
    estimatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    estimatedAt: Date
  },
  
  actualCost: {
    laborCost: {
      type: Number,
      min: 0,
      default: 0
    },
    materialsCost: {
      type: Number,
      min: 0,
      default: 0
    },
    additionalCosts: {
      type: Number,
      min: 0,
      default: 0
    },
    totalActual: {
      type: Number,
      min: 0,
      default: 0
    },
    paidBy: {
      type: String,
      enum: ['LANDLORD', 'TENANT', 'INSURANCE', 'WARRANTY'],
      default: 'LANDLORD'
    }
  },
  
  // Approval Workflow
  approval: {
    requiresApproval: {
      type: Boolean,
      default: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    approvalComments: String,
    
    costApproval: {
      approved: {
        type: Boolean,
        default: false
      },
      approvedAmount: {
        type: Number,
        min: 0
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      approvedAt: Date
    }
  },
  
  // Progress Tracking
  progressUpdates: [{
    updateBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updateType: {
      type: String,
      enum: [
        'STATUS_CHANGE',
        'PROGRESS_UPDATE',
        'COST_UPDATE',
        'COMPLETION_UPDATE',
        'ISSUE_REPORTED',
        'COMMENT'
      ],
      required: true
    },
    previousStatus: String,
    newStatus: String,
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Update message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isVisibleToTenant: {
      type: Boolean,
      default: true
    }
  }],
  
  // Media Attachments
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'BEFORE_PHOTO',
        'DURING_PHOTO',
        'AFTER_PHOTO',
        'INVOICE',
        'RECEIPT',
        'ESTIMATE',
        'TECHNICAL_DOCUMENT',
        'VIDEO',
        'AUDIO_NOTE',
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
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    fileSize: Number,
    mimeType: String,
    description: String
  }],
  
  // Inspection and Quality Control
  inspection: {
    required: {
      type: Boolean,
      default: true
    },
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    inspectedAt: Date,
    
    qualityRating: {
      type: Number,
      min: 1,
      max: 5
    },
    workmanshipRating: {
      type: Number,
      min: 1,
      max: 5
    },
    timelinessRating: {
      type: Number,
      min: 1,
      max: 5
    },
    
    inspectionNotes: String,
    issuesFound: [{
      issue: {
        type: String,
        required: true
      },
      severity: {
        type: String,
        enum: ['MINOR', 'MAJOR', 'CRITICAL'],
        default: 'MINOR'
      },
      resolved: {
        type: Boolean,
        default: false
      }
    }],
    
    passed: {
      type: Boolean,
      default: false
    },
    reinspectionRequired: {
      type: Boolean,
      default: false
    }
  },
  
  // Tenant Satisfaction
  tenantFeedback: {
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    },
    responseTimeRating: {
      type: Number,
      min: 1,
      max: 5
    },
    qualityRating: {
      type: Number,
      min: 1,
      max: 5
    },
    communicationRating: {
      type: Number,
      min: 1,
      max: 5
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    wouldRecommend: {
      type: Boolean,
      default: true
    },
    feedbackDate: Date
  },
  
  // Communication Log
  communications: [{
    type: {
      type: String,
      enum: ['EMAIL', 'SMS', 'WHATSAPP', 'PHONE_CALL', 'IN_PERSON', 'SYSTEM_NOTIFICATION'],
      required: true
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    subject: String,
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Recurring Maintenance
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY'],
    },
    nextDueDate: Date,
    parentRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceRequest'
    }
  },
  
  // Warranty Information
  warranty: {
    hasWarranty: {
      type: Boolean,
      default: false
    },
    warrantyPeriod: {
      type: Number, // in months
      default: 0
    },
    warrantyStartDate: Date,
    warrantyEndDate: Date,
    warrantyProvider: String,
    warrantyTerms: String
  },
  
  // Emergency Response
  emergency: {
    isEmergency: {
      type: Boolean,
      default: false
    },
    emergencyType: {
      type: String,
      enum: [
        'WATER_LEAK',
        'ELECTRICAL_HAZARD',
        'GAS_LEAK',
        'SECURITY_BREACH',
        'STRUCTURAL_DAMAGE',
        'FIRE_DAMAGE',
        'HEALTH_HAZARD',
        'OTHER'
      ]
    },
    reportedAt: Date,
    respondedAt: Date,
    responseTime: Number, // in minutes
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better performance

MaintenanceRequestSchema.index({ tenantId: 1, status: 1 })
MaintenanceRequestSchema.index({ landlordId: 1, status: 1 })
MaintenanceRequestSchema.index({ propertyId: 1 })
MaintenanceRequestSchema.index({ category: 1, priority: 1 })
MaintenanceRequestSchema.index({ status: 1, priority: 1 })
MaintenanceRequestSchema.index({ 'assignment.assignedTo': 1 })
MaintenanceRequestSchema.index({ createdAt: -1 })

// Compound indexes
MaintenanceRequestSchema.index({ landlordId: 1, status: 1, priority: 1 })
MaintenanceRequestSchema.index({ 'emergency.isEmergency': 1, createdAt: -1 })

// Virtual properties
MaintenanceRequestSchema.virtual('isOverdue').get(function() {
  if (!this.assignment.estimatedCompletionDate) return false
  return new Date() > this.assignment.estimatedCompletionDate && 
         !['COMPLETED', 'VERIFIED', 'CLOSED'].includes(this.status)
})

MaintenanceRequestSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0
  const diffTime = new Date() - this.assignment.estimatedCompletionDate
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

MaintenanceRequestSchema.virtual('responseTime').get(function() {
  if (!this.emergency.isEmergency || !this.emergency.reportedAt || !this.emergency.respondedAt) {
    return null
  }
  return Math.round((this.emergency.respondedAt - this.emergency.reportedAt) / (1000 * 60)) // in minutes
})

MaintenanceRequestSchema.virtual('duration').get(function() {
  if (!this.assignment.actualStartDate || !this.assignment.actualCompletionDate) {
    return null
  }
  const diffTime = this.assignment.actualCompletionDate - this.assignment.actualStartDate
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // in days
})

// Pre-save middleware
MaintenanceRequestSchema.pre('save', function(next) {
  // Auto-calculate total estimated cost
  if (this.costEstimate.laborCost || this.costEstimate.materialsCost || this.costEstimate.additionalCosts) {
    this.costEstimate.totalEstimated = 
      (this.costEstimate.laborCost || 0) + 
      (this.costEstimate.materialsCost || 0) + 
      (this.costEstimate.additionalCosts || 0)
  }
  
  // Auto-calculate total actual cost
  if (this.actualCost.laborCost || this.actualCost.materialsCost || this.actualCost.additionalCosts) {
    this.actualCost.totalActual = 
      (this.actualCost.laborCost || 0) + 
      (this.actualCost.materialsCost || 0) + 
      (this.actualCost.additionalCosts || 0)
  }
  
  // Set emergency response time
  if (this.emergency.isEmergency && this.emergency.reportedAt && this.emergency.respondedAt) {
    this.emergency.responseTime = Math.round(
      (this.emergency.respondedAt - this.emergency.reportedAt) / (1000 * 60)
    )
  }
  
  next()
})

// Instance methods
MaintenanceRequestSchema.methods.updateStatus = async function(newStatus, updatedBy, message = '') {
  const oldStatus = this.status
  this.status = newStatus
  this.updatedBy = updatedBy
  
  // Add progress update
  this.progressUpdates.push({
    updateBy: updatedBy,
    updateType: 'STATUS_CHANGE',
    previousStatus: oldStatus,
    newStatus: newStatus,
    message: message || `Status changed from ${oldStatus} to ${newStatus}`
  })
  
  // Set specific timestamps based on status
  switch (newStatus) {
    case 'ACKNOWLEDGED':
      if (this.emergency.isEmergency && !this.emergency.respondedAt) {
        this.emergency.respondedAt = new Date()
      }
      break
    case 'ASSIGNED':
      this.assignment.assignedAt = new Date()
      break
    case 'IN_PROGRESS':
      if (!this.assignment.actualStartDate) {
        this.assignment.actualStartDate = new Date()
      }
      break
    case 'COMPLETED':
      if (!this.assignment.actualCompletionDate) {
        this.assignment.actualCompletionDate = new Date()
      }
      break
  }
  
  return await this.save()
}

MaintenanceRequestSchema.methods.assignTo = async function(assignedTo, assignedBy, estimatedStartDate, estimatedCompletionDate) {
  this.assignment.assignedTo = assignedTo
  this.assignment.assignedBy = assignedBy
  this.assignment.assignedAt = new Date()
  
  if (estimatedStartDate) {
    this.assignment.estimatedStartDate = estimatedStartDate
  }
  
  if (estimatedCompletionDate) {
    this.assignment.estimatedCompletionDate = estimatedCompletionDate
  }
  
  return await this.updateStatus('ASSIGNED', assignedBy, `Request assigned to contractor`)
}

MaintenanceRequestSchema.methods.addProgressUpdate = function(updateBy, updateType, message, isVisibleToTenant = true) {
  this.progressUpdates.push({
    updateBy,
    updateType,
    message,
    isVisibleToTenant
  })
  
  this.updatedBy = updateBy
  return this.save()
}

MaintenanceRequestSchema.methods.approve = async function(approvedBy, comments = '') {
  this.approval.approvedBy = approvedBy
  this.approval.approvedAt = new Date()
  this.approval.approvalComments = comments
  
  return await this.updateStatus('APPROVED', approvedBy, 'Request approved for work to begin')
}

MaintenanceRequestSchema.methods.reject = async function(rejectedBy, reason) {
  return await this.updateStatus('REJECTED', rejectedBy, `Request rejected: ${reason}`)
}

MaintenanceRequestSchema.methods.complete = async function(completedBy, completionNotes = '') {
  this.assignment.actualCompletionDate = new Date()
  
  return await this.updateStatus('COMPLETED', completedBy, 
    `Work completed. ${completionNotes}`.trim())
}

MaintenanceRequestSchema.methods.inspect = async function(inspectedBy, qualityRating, notes, passed = true) {
  this.inspection.inspectedBy = inspectedBy
  this.inspection.inspectedAt = new Date()
  this.inspection.qualityRating = qualityRating
  this.inspection.inspectionNotes = notes
  this.inspection.passed = passed
  
  if (passed) {
    return await this.updateStatus('VERIFIED', inspectedBy, 'Work inspected and approved')
  } else {
    this.inspection.reinspectionRequired = true
    return await this.updateStatus('IN_PROGRESS', inspectedBy, 'Inspection failed, rework required')
  }
}

MaintenanceRequestSchema.methods.addTenantFeedback = async function(ratings, comments) {
  this.tenantFeedback = {
    ...ratings,
    comments,
    feedbackDate: new Date()
  }
  
  // Calculate overall rating
  const ratingFields = ['satisfactionRating', 'responseTimeRating', 'qualityRating', 'communicationRating']
  const validRatings = ratingFields.filter(field => ratings[field]).map(field => ratings[field])
  
  if (validRatings.length > 0) {
    this.tenantFeedback.overallRating = 
      Math.round(validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length)
  }
  
  return await this.updateStatus('CLOSED', this.tenantId, 'Tenant feedback submitted')
}

MaintenanceRequestSchema.methods.escalate = async function(escalatedBy, reason) {
  // Increase priority
  const priorityLevels = ['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'EMERGENCY']
  const currentIndex = priorityLevels.indexOf(this.priority)
  
  if (currentIndex < priorityLevels.length - 1) {
    this.priority = priorityLevels[currentIndex + 1]
  }
  
  return await this.addProgressUpdate(escalatedBy, 'ISSUE_REPORTED', 
    `Request escalated: ${reason}`)
}

// Static methods
MaintenanceRequestSchema.statics.findByStatus = function(status, landlordId = null) {
  const query = { status }
  if (landlordId) query.landlordId = landlordId
  
  return this.find(query)
    .populate('tenantId', 'firstName lastName phone email')
    .populate('propertyId', 'title address')
    .populate('assignment.assignedTo', 'firstName lastName phone')
    .sort({ priority: -1, createdAt: -1 })
}

MaintenanceRequestSchema.statics.findOverdue = function(landlordId = null) {
  const query = {
    'assignment.estimatedCompletionDate': { $lt: new Date() },
    status: { $nin: ['COMPLETED', 'VERIFIED', 'CLOSED', 'CANCELLED'] }
  }
  
  if (landlordId) query.landlordId = landlordId
  
  return this.find(query)
    .populate('tenantId propertyId assignment.assignedTo')
    .sort({ 'assignment.estimatedCompletionDate': 1 })
}

MaintenanceRequestSchema.statics.findEmergencies = function(landlordId = null) {
  const query = { 'emergency.isEmergency': true }
  if (landlordId) query.landlordId = landlordId
  
  return this.find(query)
    .populate('tenantId propertyId')
    .sort({ createdAt: -1 })
}

MaintenanceRequestSchema.statics.findByProperty = function(propertyId, filters = {}) {
  return this.find({ 
    propertyId, 
    ...filters 
  }).sort({ createdAt: -1 })
}

MaintenanceRequestSchema.statics.findByTenant = function(tenantId, filters = {}) {
  return this.find({ 
    tenantId, 
    ...filters 
  }).sort({ createdAt: -1 })
}

MaintenanceRequestSchema.statics.getMaintenanceStats = async function(landlordId) {
  const pipeline = [
    { $match: { landlordId: mongoose.Types.ObjectId(landlordId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { 
            $cond: [
              { $in: ['$status', ['SUBMITTED', 'ACKNOWLEDGED', 'IN_REVIEW']] }, 
              1, 
              0
            ] 
          }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] }
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
        },
        emergency: {
          $sum: { $cond: ['$emergency.isEmergency', 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$assignment.estimatedCompletionDate', new Date()] },
                  { $nin: ['$status', ['COMPLETED', 'VERIFIED', 'CLOSED']] }
                ]
              },
              1,
              0
            ]
          }
        },
        averageCost: { $avg: '$actualCost.totalActual' },
        totalCost: { $sum: '$actualCost.totalActual' },
        averageRating: { $avg: '$tenantFeedback.overallRating' }
      }
    }
  ]
  
  const result = await this.aggregate(pipeline)
  return result[0] || {}
}

export default mongoose.models.MaintenanceRequest || mongoose.model('MaintenanceRequest', MaintenanceRequestSchema)