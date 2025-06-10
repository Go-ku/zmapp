import { mongoose } from '../db/connection.js'

const PaymentSchema = new mongoose.Schema({
  // Basic Payment Information
  paymentRef: {
    type: String,
    unique: true,
    required: [true, 'Payment reference is required'],
    uppercase: true,
    match: [/^PAY\d{6}[A-Z0-9]{6}$/, 'Invalid payment reference format']
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
  leaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lease',
    required: [true, 'Lease is required']
  },
  
  // Payment Details
  paymentType: {
    type: String,
    enum: [
      'MONTHLY_RENT',
      'DEPOSIT',
      'SERVICE_CHARGE',
      'LATE_FEE',
      'UTILITY_BILL',
      'MAINTENANCE_FEE',
      'PENALTY',
      'REFUND',
      'PARTIAL_PAYMENT',
      'OTHER'
    ],
    required: [true, 'Payment type is required']
  },
  
  // Amount Information
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Payment amount must be greater than 0']
  },
  currency: {
    type: String,
    enum: ['ZMW', 'USD'],
    default: 'ZMW'
  },
  expectedAmount: {
    type: Number,
    required: [true, 'Expected amount is required'],
    min: [0.01, 'Expected amount must be greater than 0']
  },
  
  // Payment Period Information
  paymentPeriod: {
    month: {
      type: Number,
      required: true,
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12']
    },
    year: {
      type: Number,
      required: true,
      min: [2020, 'Year must be 2020 or later']
    }
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  
  // Payment Method and Transaction Details
  paymentMethod: {
    type: String,
    enum: [
      'CASH',
      'BANK_TRANSFER',
      'CHEQUE',
      'MTN_MOBILE_MONEY',
      'AIRTEL_MONEY',
      'ZAMTEL_KWACHA',
      'CARD_PAYMENT',
      'CRYPTO',
      'OTHER'
    ],
    required: [true, 'Payment method is required']
  },
  
  transactionDetails: {
    transactionId: {
      type: String,
      trim: true
    },
    transactionDate: {
      type: Date,
      default: Date.now
    },
    bankName: String,
    accountNumber: String,
    chequeNumber: String,
    mobileMoneyNumber: String,
    confirmationCode: String,
    receiptNumber: String,
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  
  // Payment Status and Approval Workflow
  status: {
    type: String,
    enum: [
      'PENDING_APPROVAL',
      'APPROVED',
      'REJECTED',
      'PARTIALLY_APPROVED',
      'CANCELLED',
      'REFUNDED'
    ],
    default: 'PENDING_APPROVAL'
  },
  
  // Approval Workflow
  approvalWorkflow: {
    requiredApprovers: [{
      approverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['LANDLORD', 'STAFF', 'SYSTEM_ADMIN'],
        required: true
      },
      order: {
        type: Number,
        required: true,
        min: 1
      }
    }],
    
    approvals: [{
      approverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      action: {
        type: String,
        enum: ['APPROVED', 'REJECTED', 'REQUESTED_CHANGES'],
        required: true
      },
      approvedAmount: {
        type: Number,
        min: 0
      },
      comments: {
        type: String,
        maxlength: [1000, 'Comments cannot exceed 1000 characters']
      },
      approvedAt: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String
    }],
    
    currentStep: {
      type: Number,
      default: 1
    },
    isComplete: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  },
  
  // Payment Verification
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationMethod: {
      type: String,
      enum: ['BANK_STATEMENT', 'RECEIPT_UPLOAD', 'SYSTEM_INTEGRATION', 'MANUAL_VERIFICATION']
    },
    verificationNotes: String
  },
  
  // Receipt Information
  receipt: {
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true // Allows null values while maintaining uniqueness
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    issuedAt: Date,
    receiptUrl: String, // URL to generated receipt PDF
    sentToTenant: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    sentVia: [{
      method: {
        type: String,
        enum: ['EMAIL', 'WHATSAPP', 'SMS', 'PORTAL']
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['SENT', 'DELIVERED', 'FAILED'],
        default: 'SENT'
      }
    }]
  },
  
  // Late Payment Information
  latePayment: {
    isLate: {
      type: Boolean,
      default: false
    },
    daysLate: {
      type: Number,
      default: 0
    },
    lateFeeApplied: {
      type: Number,
      default: 0
    },
    lateFeeWaived: {
      type: Boolean,
      default: false
    },
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    waivedReason: String
  },
  
  // Partial Payment Information
  partialPayments: [{
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: [
        'CASH',
        'BANK_TRANSFER',
        'CHEQUE',
        'MTN_MOBILE_MONEY',
        'AIRTEL_MONEY',
        'ZAMTEL_KWACHA',
        'CARD_PAYMENT',
        'OTHER'
      ]
    },
    transactionId: String,
    notes: String
  }],
  
  // Refund Information
  refund: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundReason: String,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundedAt: Date,
    refundMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'CASH', 'MOBILE_MONEY', 'CHEQUE']
    },
    refundTransactionId: String
  },
  
  // Document Attachments
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'BANK_SLIP',
        'MOBILE_MONEY_RECEIPT',
        'CHEQUE_COPY',
        'PAYMENT_PROOF',
        'BANK_STATEMENT',
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
    mimeType: String
  }],
  
  // Communication Log
  communications: [{
    type: {
      type: String,
      enum: ['EMAIL', 'SMS', 'WHATSAPP', 'PHONE_CALL', 'IN_PERSON', 'SYSTEM_NOTIFICATION'],
      required: true
    },
    direction: {
      type: String,
      enum: ['INCOMING', 'OUTGOING'],
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
    status: {
      type: String,
      enum: ['SENT', 'DELIVERED', 'READ', 'FAILED'],
      default: 'SENT'
    }
  }],
  
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
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Staff member who logged the payment
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better performance

PaymentSchema.index({ tenantId: 1, status: 1 })
PaymentSchema.index({ landlordId: 1, status: 1 })
PaymentSchema.index({ propertyId: 1 })
PaymentSchema.index({ leaseId: 1 })
PaymentSchema.index({ dueDate: 1, status: 1 })
PaymentSchema.index({ 'paymentPeriod.year': 1, 'paymentPeriod.month': 1 })
PaymentSchema.index({ status: 1, createdAt: -1 })


// Compound indexes
PaymentSchema.index({ tenantId: 1, 'paymentPeriod.year': 1, 'paymentPeriod.month': 1 })
PaymentSchema.index({ landlordId: 1, status: 1, dueDate: 1 })

// Virtual properties
PaymentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate && 
         !['APPROVED', 'REFUNDED'].includes(this.status)
})

PaymentSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0
  const diffTime = new Date() - this.dueDate
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

PaymentSchema.virtual('amountPaid').get(function() {
  if (this.status === 'APPROVED') return this.amount
  if (this.status === 'PARTIALLY_APPROVED') {
    const approvedApproval = this.approvalWorkflow.approvals.find(
      approval => approval.action === 'APPROVED'
    )
    return approvedApproval ? approvedApproval.approvedAmount : 0
  }
  return 0
})

PaymentSchema.virtual('balanceRemaining').get(function() {
  return this.expectedAmount - this.amountPaid
})

PaymentSchema.virtual('isPartialPayment').get(function() {
  return this.amount < this.expectedAmount
})

PaymentSchema.virtual('paymentPeriodString').get(function() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${months[this.paymentPeriod.month - 1]} ${this.paymentPeriod.year}`
})

// Pre-save middleware
PaymentSchema.pre('save', function(next) {
  // Calculate late payment information
  if (this.dueDate && new Date() > this.dueDate) {
    this.latePayment.isLate = true
    const diffTime = new Date() - this.dueDate
    this.latePayment.daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  
  // Auto-generate receipt number if approved and not already generated
  if (this.status === 'APPROVED' && !this.receipt.receiptNumber) {
    this.receipt.receiptNumber = this.generateReceiptNumber()
    this.receipt.issuedAt = new Date()
  }
  
  next()
})

// Instance methods
PaymentSchema.methods.generateReceiptNumber = function() {
  const year = new Date().getFullYear()
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `RCP${year}${month}${random}`
}

PaymentSchema.methods.canBeApproved = function() {
  return this.status === 'PENDING_APPROVAL' && 
         this.amount > 0 &&
         this.attachments.length > 0
}

PaymentSchema.methods.approve = async function(approverId, approvedAmount = null, comments = '') {
  if (!this.canBeApproved()) {
    throw new Error('Payment cannot be approved at this time')
  }
  
  const finalAmount = approvedAmount || this.amount
  
  // Add approval to workflow
  this.approvalWorkflow.approvals.push({
    approverId,
    action: 'APPROVED',
    approvedAmount: finalAmount,
    comments
  })
  
  // Update status
  if (finalAmount >= this.expectedAmount) {
    this.status = 'APPROVED'
  } else {
    this.status = 'PARTIALLY_APPROVED'
  }
  
  this.approvalWorkflow.isComplete = true
  this.approvalWorkflow.completedAt = new Date()
  
  // Generate receipt
  if (!this.receipt.receiptNumber) {
    this.receipt.receiptNumber = this.generateReceiptNumber()
    this.receipt.issuedBy = approverId
    this.receipt.issuedAt = new Date()
  }
  
  return await this.save()
}

PaymentSchema.methods.reject = async function(approverId, comments = '') {
  this.approvalWorkflow.approvals.push({
    approverId,
    action: 'REJECTED',
    comments
  })
  
  this.status = 'REJECTED'
  this.approvalWorkflow.isComplete = true
  this.approvalWorkflow.completedAt = new Date()
  
  return await this.save()
}

PaymentSchema.methods.addPartialPayment = function(amount, paymentMethod, transactionId, notes) {
  this.partialPayments.push({
    amount,
    paymentMethod,
    transactionId,
    notes
  })
  
  // Update total amount
  const totalPaid = this.partialPayments.reduce((sum, payment) => sum + payment.amount, 0)
  this.amount = totalPaid
  
  return this.save()
}

PaymentSchema.methods.sendReceipt = async function(methods = ['EMAIL', 'WHATSAPP']) {
  const sendPromises = methods.map(async (method) => {
    try {
      // Implementation would depend on your notification service
      // For now, we'll just log the send attempt
      this.receipt.sentVia.push({
        method,
        status: 'SENT'
      })
      
      return { method, status: 'SENT' }
    } catch (error) {
      this.receipt.sentVia.push({
        method,
        status: 'FAILED'
      })
      
      return { method, status: 'FAILED', error: error.message }
    }
  })
  
  const results = await Promise.all(sendPromises)
  this.receipt.sentToTenant = true
  this.receipt.sentAt = new Date()
  
  await this.save()
  return results
}

PaymentSchema.methods.applyLateFee = function(feeAmount, appliedBy) {
  this.latePayment.lateFeeApplied = feeAmount
  this.expectedAmount += feeAmount
  
  // Log the late fee application
  this.communications.push({
    type: 'SYSTEM_NOTIFICATION',
    direction: 'OUTGOING',
    from: appliedBy,
    to: this.tenantId,
    subject: 'Late Fee Applied',
    message: `A late fee of ${feeAmount} ${this.currency} has been applied to your payment.`
  })
  
  return this.save()
}

PaymentSchema.methods.waiveLateFee = function(waivedBy, reason) {
  this.latePayment.lateFeeWaived = true
  this.latePayment.waivedBy = waivedBy
  this.latePayment.waivedReason = reason
  this.expectedAmount -= this.latePayment.lateFeeApplied
  this.latePayment.lateFeeApplied = 0
  
  return this.save()
}

PaymentSchema.methods.processRefund = async function(refundAmount, reason, refundedBy, refundMethod) {
  if (refundAmount > this.amountPaid) {
    throw new Error('Refund amount cannot exceed the amount paid')
  }
  
  this.refund = {
    isRefunded: true,
    refundAmount,
    refundReason: reason,
    refundedBy,
    refundedAt: new Date(),
    refundMethod
  }
  
  this.status = 'REFUNDED'
  
  return await this.save()
}

// Static methods
PaymentSchema.statics.findOverduePayments = function(landlordId = null) {
  const query = {
    dueDate: { $lt: new Date() },
    status: { $in: ['PENDING_APPROVAL', 'REJECTED'] }
  }
  
  if (landlordId) {
    query.landlordId = landlordId
  }
  
  return this.find(query)
    .populate('tenantId', 'firstName lastName phone email')
    .populate('propertyId', 'title address')
    .sort({ dueDate: 1 })
}

PaymentSchema.statics.findByTenant = function(tenantId, filters = {}) {
  return this.find({ 
    tenantId, 
    ...filters 
  }).sort({ dueDate: -1 })
}

PaymentSchema.statics.findByLandlord = function(landlordId, filters = {}) {
  return this.find({ 
    landlordId, 
    ...filters 
  }).sort({ createdAt: -1 })
}

PaymentSchema.statics.findPendingApprovals = function(landlordId = null) {
  const query = { status: 'PENDING_APPROVAL' }
  
  if (landlordId) {
    query.landlordId = landlordId
  }
  
  return this.find(query)
    .populate('tenantId', 'firstName lastName phone email')
    .populate('propertyId', 'title address')
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: 1 })
}
PaymentSchema.statics.getSystemStats = async function(dateFilter) {
  try {
    // Handle different dateFilter formats
    let startDate
    if (dateFilter?.start) {
      startDate = new Date(dateFilter.start)
    } else if (dateFilter) {
      startDate = new Date(dateFilter)
    } else {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
    }

    console.log('Using start date for payment stats:', startDate)

    const stats = await this.aggregate([
      {
        $facet: {
          total: [
            {
              $match: { 
                status: { $in: ['APPROVED'] }, // Use your actual status values
                amount: { $exists: true, $type: "number" }
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ],
          monthly: [
            {
              $match: {
                createdAt: { $gte: startDate },
                status: { $in: ['APPROVED'] }, // Use your actual status values
                amount: { $exists: true, $type: "number" }
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ],
          pending: [
            {
              $match: { status: 'PENDING_APPROVAL' } // Use your actual status
            },
            { $count: "count" }
          ],
          overdue: [
            {
              $match: {
                status: 'PENDING_APPROVAL', // You might need a different status for overdue
                dueDate: { 
                  $exists: true,
                  $lt: new Date() 
                }
              }
            },
            { $count: "count" }
          ],
          pendingApprovals: [
            {
              $match: { status: 'PENDING_APPROVAL' } // Use your actual status
            },
            { $count: "count" }
          ]
        }
      }
    ])

    console.log('Fixed aggregation result:', JSON.stringify(stats[0], null, 2))

    const result = stats[0]
    
    const finalResult = {
      total: result.total[0]?.total || 0,
      monthly: result.monthly[0]?.total || 0,
      pending: result.pending[0]?.count || 0,
      overdue: result.overdue[0]?.count || 0,
      pendingApprovals: result.pendingApprovals[0]?.count || 0
    }
    
    console.log('Fixed final result:', finalResult)
    return finalResult
    
  } catch (error) {
    console.error('Error in getSystemStats:', error)
    return {
      total: 0,
      monthly: 0,
      pending: 0,
      overdue: 0,
      pendingApprovals: 0
    }
  }
}
  PaymentSchema.statics.getLandlordStats = async function(landlordId, dateFilter) {
    const stats = await this.aggregate([
      {
        $lookup: {
          from: 'properties',
          localField: 'propertyId',
          foreignField: '_id',
          as: 'property'
        }
      },
      {
        $match: {
          'property.landlordId': new mongoose.Types.ObjectId(landlordId)
        }
      },
      {
        $facet: {
          monthly: [
            {
              $match: {
                createdAt: { $gte: dateFilter.start },
                status: { $in: ['completed', 'approved'] }
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ],
          yearly: [
            {
              $match: {
                createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
                status: { $in: ['completed', 'approved'] }
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ],
          pending: [
            { $match: { status: 'pending' } },
            { $count: "count" }
          ],
          overdue: [
            { $match: { status: 'overdue' } },
            { $count: "count" }
          ]
        }
      }
    ])

    const result = stats[0]
    return {
      monthly: result.monthly[0]?.total || 0,
      yearly: result.yearly[0]?.total || 0,
      pending: result.pending[0]?.count || 0,
      overdue: result.overdue[0]?.count || 0
    }
  }

   PaymentSchema.statics.getTenantStats = async function(tenantId, dateFilter) {
    const stats = await this.aggregate([
      {
        $match: { tenantId: new mongoose.Types.ObjectId(tenantId) }
      },
      {
        $facet: {
          totalPaid: [
            {
              $match: { status: { $in: ['completed', 'approved'] } }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ],
          balance: [
            {
              $group: {
                _id: null,
                paid: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ['completed', 'approved']] },
                      "$amount",
                      0
                    ]
                  }
                },
                owed: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ['pending', 'overdue']] },
                      "$amount",
                      0
                    ]
                  }
                }
              }
            }
          ],
          lastPayment: [
            {
              $match: { status: { $in: ['completed', 'approved'] } }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          nextPayment: [
            {
              $match: { status: 'pending' }
            },
            { $sort: { dueDate: 1 } },
            { $limit: 1 }
          ]
        }
      }
    ])

    const result = stats[0]
    const balanceData = result.balance[0] || { paid: 0, owed: 0 }
    
    return {
      totalPaid: result.totalPaid[0]?.total || 0,
      balance: balanceData.owed - balanceData.paid,
      lastPaymentDate: result.lastPayment[0]?.createdAt,
      nextPaymentDue: result.nextPayment[0]?.dueDate,
      nextPaymentAmount: result.nextPayment[0]?.amount || 0,
      status: balanceData.owed > balanceData.paid ? 'overdue' : 'current'
    }
  }

PaymentSchema.statics.getPaymentStats = async function(landlordId, year = new Date().getFullYear()) {
  const pipeline = [
    { 
      $match: { 
        landlordId: mongoose.Types.ObjectId(landlordId),
        'paymentPeriod.year': year
      } 
    },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { 
          $sum: { 
            $cond: [
              { $eq: ['$status', 'APPROVED'] }, 
              '$amount', 
              0
            ] 
          } 
        },
        pendingAmount: { 
          $sum: { 
            $cond: [
              { $eq: ['$status', 'PENDING_APPROVAL'] }, 
              '$amount', 
              0
            ] 
          } 
        },
        overdueCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$status', 'APPROVED'] }
                ]
              },
              1,
              0
            ]
          }
        },
        averagePaymentTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'APPROVED'] },
              {
                $subtract: [
                  { $arrayElemAt: ['$approvalWorkflow.approvals.approvedAt', 0] },
                  '$createdAt'
                ]
              },
              null
            ]
          }
        }
      }
    }
  ]
  
  const result = await this.aggregate(pipeline)
  return result[0] || {}
}

PaymentSchema.statics.getMonthlyRevenue = async function(landlordId, year = new Date().getFullYear()) {
  const pipeline = [
    {
      $match: {
        landlordId: mongoose.Types.ObjectId(landlordId),
        'paymentPeriod.year': year,
        status: 'APPROVED'
      }
    },
    {
      $group: {
        _id: '$paymentPeriod.month',
        totalRevenue: { $sum: '$amount' },
        paymentCount: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]
  
  return await this.aggregate(pipeline)
}

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)