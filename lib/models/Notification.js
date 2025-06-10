import { mongoose } from '../db/connection.js'

const NotificationSchema = new mongoose.Schema({
  // Basic Notification Information
  notificationId: {
    type: String,
    unique: true,
    required: [true, 'Notification ID is required'],
    default: function() {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substr(2, 5)
      return `NOTIF_${timestamp}_${random}`.toUpperCase()
    }
  },
  
  // Recipients
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notification Content
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  shortMessage: {
    type: String,
    trim: true,
    maxlength: [160, 'Short message cannot exceed 160 characters'] // For SMS
  },
  
  // Notification Type and Category
  type: {
    type: String,
    enum: [
      'PAYMENT_REMINDER',
      'PAYMENT_OVERDUE',
      'PAYMENT_RECEIVED',
      'PAYMENT_APPROVED',
      'PAYMENT_REJECTED',
      'LEASE_EXPIRY',
      'LEASE_RENEWAL',
      'MAINTENANCE_REQUEST',
      'MAINTENANCE_UPDATE',
      'MAINTENANCE_COMPLETED',
      'PROPERTY_UPDATE',
      'SYSTEM_ANNOUNCEMENT',
      'WELCOME',
      'INVOICE_GENERATED',
      'RECEIPT_ISSUED',
      'DOCUMENT_UPLOAD',
      'USER_MENTION',
      'TASK_ASSIGNED',
      'APPROVAL_REQUEST',
      'SECURITY_ALERT',
      'OTHER'
    ],
    required: [true, 'Notification type is required']
  },
  
  category: {
    type: String,
    enum: [
      'FINANCIAL',
      'MAINTENANCE',
      'LEGAL',
      'PROPERTY',
      'SYSTEM',
      'REMINDER',
      'ALERT',
      'INFORMATION'
    ],
    required: [true, 'Notification category is required']
  },
  
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  
  // Delivery Channels
  channels: {
    inApp: {
      enabled: {
        type: Boolean,
        default: true
      },
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      read: {
        type: Boolean,
        default: false
      },
      readAt: Date
    },
    
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      emailAddress: String,
      subject: String,
      htmlContent: String,
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      opened: {
        type: Boolean,
        default: false
      },
      openedAt: Date,
      bounced: {
        type: Boolean,
        default: false
      },
      bouncedAt: Date,
      messageId: String // External email service message ID
    },
    
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      phoneNumber: String,
      message: String,
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      failed: {
        type: Boolean,
        default: false
      },
      failureReason: String,
      messageId: String // SMS service message ID
    },
    
    whatsapp: {
      enabled: {
        type: Boolean,
        default: false
      },
      phoneNumber: String,
      message: String,
      templateId: String,
      templateParams: [String],
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      read: {
        type: Boolean,
        default: false
      },
      readAt: Date,
      failed: {
        type: Boolean,
        default: false
      },
      failureReason: String,
      messageId: String // WhatsApp API message ID
    },
    
    push: {
      enabled: {
        type: Boolean,
        default: false
      },
      deviceTokens: [String],
      delivered: {
        type: Boolean,
        default: false
      },
      deliveredAt: Date,
      clicked: {
        type: Boolean,
        default: false
      },
      clickedAt: Date,
      messageId: String
    }
  },
  
  // Related Objects
  relatedObjects: {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lease'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    maintenanceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceRequest'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Action and Navigation
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: [50, 'Action text cannot exceed 50 characters']
  },
  
  // Scheduling
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  
  // Status and Tracking
  status: {
    type: String,
    enum: [
      'DRAFT',
      'SCHEDULED',
      'SENDING',
      'SENT',
      'DELIVERED',
      'READ',
      'FAILED',
      'CANCELLED',
      'EXPIRED'
    ],
    default: 'DRAFT'
  },
  
  // Retry Logic
  retryConfig: {
    maxRetries: {
      type: Number,
      default: 3
    },
    retryCount: {
      type: Number,
      default: 0
    },
    nextRetryAt: Date,
    retryInterval: {
      type: Number, // in minutes
      default: 30
    }
  },
  
  // Delivery Tracking
  deliveryAttempts: [{
    channel: {
      type: String,
      enum: ['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH'],
      required: true
    },
    attemptedAt: {
      type: Date,
      default: Date.now
    },
    successful: {
      type: Boolean,
      required: true
    },
    errorMessage: String,
    responseData: mongoose.Schema.Types.Mixed
  }],
  
  // Batch Information
  batchId: {
    type: String,
    index: true
  },
  batchSize: Number,
  batchIndex: Number,
  
  // Template Information
  template: {
    templateId: String,
    templateName: String,
    templateVariables: mongoose.Schema.Types.Mixed,
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Personalization
  personalization: {
    recipientName: String,
    propertyAddress: String,
    customVariables: mongoose.Schema.Types.Mixed
  },
  
  // Analytics and Tracking
  analytics: {
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    openedFromLocation: String,
    referrer: String
  },
  
  // User Preferences Override
  preferencesOverride: {
    ignoreUserPreferences: {
      type: Boolean,
      default: false
    },
    forceDelivery: {
      type: Boolean,
      default: false
    },
    reasonForOverride: String
  },
  
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['SYSTEM', 'USER', 'API', 'CRON', 'WEBHOOK'],
      default: 'SYSTEM'
    },
    tags: [String],
    customData: mongoose.Schema.Types.Mixed
  },
  
  // Audit Trail
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better performance

NotificationSchema.index({ recipientId: 1, status: 1 })
NotificationSchema.index({ recipientId: 1, 'channels.inApp.read': 1 })
NotificationSchema.index({ type: 1, category: 1 })
NotificationSchema.index({ scheduledFor: 1, status: 1 })
NotificationSchema.index({ batchId: 1 })
NotificationSchema.index({ createdAt: -1 })
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Compound indexes
NotificationSchema.index({ recipientId: 1, createdAt: -1 })
NotificationSchema.index({ status: 1, scheduledFor: 1 })
NotificationSchema.index({ 'relatedObjects.propertyId': 1, type: 1 })

// Virtual properties
NotificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt
})

NotificationSchema.virtual('isDelivered').get(function() {
  const channels = this.channels
  return channels.inApp.delivered || 
         channels.email.delivered || 
         channels.sms.delivered || 
         channels.whatsapp.delivered || 
         channels.push.delivered
})

NotificationSchema.virtual('totalDeliveredChannels').get(function() {
  const channels = this.channels
  let count = 0
  if (channels.inApp.enabled && channels.inApp.delivered) count++
  if (channels.email.enabled && channels.email.delivered) count++
  if (channels.sms.enabled && channels.sms.delivered) count++
  if (channels.whatsapp.enabled && channels.whatsapp.delivered) count++
  if (channels.push.enabled && channels.push.delivered) count++
  return count
})

NotificationSchema.virtual('deliveryRate').get(function() {
  const channels = this.channels
  let enabledCount = 0
  let deliveredCount = 0
  
  if (channels.inApp.enabled) {
    enabledCount++
    if (channels.inApp.delivered) deliveredCount++
  }
  if (channels.email.enabled) {
    enabledCount++
    if (channels.email.delivered) deliveredCount++
  }
  if (channels.sms.enabled) {
    enabledCount++
    if (channels.sms.delivered) deliveredCount++
  }
  if (channels.whatsapp.enabled) {
    enabledCount++
    if (channels.whatsapp.delivered) deliveredCount++
  }
  if (channels.push.enabled) {
    enabledCount++
    if (channels.push.delivered) deliveredCount++
  }
  
  return enabledCount > 0 ? (deliveredCount / enabledCount) * 100 : 0
})

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  // Auto-generate short message for SMS if not provided
  if (this.channels.sms.enabled && !this.shortMessage) {
    this.shortMessage = this.message.length > 160 ? 
      this.message.substring(0, 157) + '...' : 
      this.message
  }
  
  // Set email subject if not provided
  if (this.channels.email.enabled && !this.channels.email.subject) {
    this.channels.email.subject = this.title
  }
  
  // Set WhatsApp message if not provided
  if (this.channels.whatsapp.enabled && !this.channels.whatsapp.message) {
    this.channels.whatsapp.message = this.message
  }
  
  next()
})

// Instance methods
NotificationSchema.methods.markAsRead = async function(channel = 'inApp') {
  const channelKey = channel.toLowerCase()
  
  if (this.channels[channelKey]) {
    this.channels[channelKey].read = true
    this.channels[channelKey].readAt = new Date()
    
    // Update overall status if all channels are read
    if (this.status === 'DELIVERED') {
      const allRead = Object.keys(this.channels).every(ch => 
        !this.channels[ch].enabled || this.channels[ch].read
      )
      if (allRead) {
        this.status = 'READ'
      }
    }
  }
  
  return await this.save()
}

NotificationSchema.methods.markAsDelivered = async function(channel, messageId = null) {
  const channelKey = channel.toLowerCase()
  
  if (this.channels[channelKey]) {
    this.channels[channelKey].delivered = true
    this.channels[channelKey].deliveredAt = new Date()
    
    if (messageId) {
      this.channels[channelKey].messageId = messageId
    }
    
    // Update overall status
    if (this.status === 'SENDING' || this.status === 'SENT') {
      this.status = 'DELIVERED'
    }
    
    // Record successful delivery attempt
    this.deliveryAttempts.push({
      channel: channel.toUpperCase(),
      successful: true
    })
  }
  
  return await this.save()
}

NotificationSchema.methods.markAsFailed = async function(channel, errorMessage) {
  const channelKey = channel.toLowerCase()
  
  if (this.channels[channelKey]) {
    this.channels[channelKey].failed = true
    this.channels[channelKey].failureReason = errorMessage
    
    // Record failed delivery attempt
    this.deliveryAttempts.push({
      channel: channel.toUpperCase(),
      successful: false,
      errorMessage
    })
    
    // Increment retry count
    this.retryConfig.retryCount++
    
    // Schedule retry if under max retries
    if (this.retryConfig.retryCount < this.retryConfig.maxRetries) {
      const nextRetry = new Date()
      nextRetry.setMinutes(nextRetry.getMinutes() + this.retryConfig.retryInterval)
      this.retryConfig.nextRetryAt = nextRetry
      this.status = 'SCHEDULED'
    } else {
      this.status = 'FAILED'
    }
  }
  
  return await this.save()
}

NotificationSchema.methods.send = async function() {
  this.status = 'SENDING'
  await this.save()
  
  const deliveryPromises = []
  
  // Send via enabled channels
  if (this.channels.inApp.enabled) {
    deliveryPromises.push(this.sendInApp())
  }
  
  if (this.channels.email.enabled) {
    deliveryPromises.push(this.sendEmail())
  }
  
  if (this.channels.sms.enabled) {
    deliveryPromises.push(this.sendSMS())
  }
  
  if (this.channels.whatsapp.enabled) {
    deliveryPromises.push(this.sendWhatsApp())
  }
  
  if (this.channels.push.enabled) {
    deliveryPromises.push(this.sendPushNotification())
  }
  
  const results = await Promise.allSettled(deliveryPromises)
  
  // Update status based on results
  const hasSuccess = results.some(result => result.status === 'fulfilled')
  this.status = hasSuccess ? 'SENT' : 'FAILED'
  
  return await this.save()
}

NotificationSchema.methods.sendInApp = async function() {
  // In-app notifications are stored in database and marked as delivered immediately
  this.channels.inApp.delivered = true
  this.channels.inApp.deliveredAt = new Date()
  return { success: true, channel: 'inApp' }
}

NotificationSchema.methods.sendEmail = async function() {
  // Implementation would integrate with email service (SendGrid, Mailgun, etc.)
  // For now, we'll simulate the sending
  try {
    // const emailService = require('../services/email')
    // const result = await emailService.send({
    //   to: this.channels.email.emailAddress,
    //   subject: this.channels.email.subject,
    //   html: this.channels.email.htmlContent || this.message
    // })
    
    await this.markAsDelivered('email', 'simulated-email-id')
    return { success: true, channel: 'email' }
  } catch (error) {
    await this.markAsFailed('email', error.message)
    throw error
  }
}

NotificationSchema.methods.sendSMS = async function() {
  // Implementation would integrate with SMS service
  try {
    // const smsService = require('../services/sms')
    // const result = await smsService.send({
    //   to: this.channels.sms.phoneNumber,
    //   message: this.channels.sms.message || this.shortMessage
    // })
    
    await this.markAsDelivered('sms', 'simulated-sms-id')
    return { success: true, channel: 'sms' }
  } catch (error) {
    await this.markAsFailed('sms', error.message)
    throw error
  }
}

NotificationSchema.methods.sendWhatsApp = async function() {
  // Implementation would integrate with WhatsApp Business API
  try {
    // const whatsappService = require('../services/whatsapp')
    // const result = await whatsappService.send({
    //   to: this.channels.whatsapp.phoneNumber,
    //   message: this.channels.whatsapp.message,
    //   templateId: this.channels.whatsapp.templateId,
    //   templateParams: this.channels.whatsapp.templateParams
    // })
    
    await this.markAsDelivered('whatsapp', 'simulated-whatsapp-id')
    return { success: true, channel: 'whatsapp' }
  } catch (error) {
    await this.markAsFailed('whatsapp', error.message)
    throw error
  }
}

NotificationSchema.methods.sendPushNotification = async function() {
  // Implementation would integrate with push notification service (FCM, APNS)
  try {
    // const pushService = require('../services/push')
    // const result = await pushService.send({
    //   tokens: this.channels.push.deviceTokens,
    //   title: this.title,
    //   body: this.message,
    //   data: { notificationId: this.notificationId }
    // })
    
    await this.markAsDelivered('push', 'simulated-push-id')
    return { success: true, channel: 'push' }
  } catch (error) {
    await this.markAsFailed('push', error.message)
    throw error
  }
}

NotificationSchema.methods.cancel = async function() {
  this.status = 'CANCELLED'
  return await this.save()
}

// Static methods
NotificationSchema.statics.findUnreadByUser = function(userId) {
  return this.find({
    recipientId: userId,
    'channels.inApp.enabled': true,
    'channels.inApp.delivered': true,
    'channels.inApp.read': false,
    status: { $ne: 'EXPIRED' }
  }).sort({ createdAt: -1 })
}

NotificationSchema.statics.findByUser = function(userId, filters = {}) {
  return this.find({
    recipientId: userId,
    'channels.inApp.enabled': true,
    'channels.inApp.delivered': true,
    ...filters
  }).sort({ createdAt: -1 })
}

NotificationSchema.statics.findPendingDelivery = function() {
  return this.find({
    status: 'SCHEDULED',
    scheduledFor: { $lte: new Date() }
  }).sort({ scheduledFor: 1 })
}

NotificationSchema.statics.findFailedRetries = function() {
  return this.find({
    status: 'SCHEDULED',
    'retryConfig.nextRetryAt': { $lte: new Date() },
    'retryConfig.retryCount': { $lt: this.retryConfig.maxRetries }
  })
}

NotificationSchema.statics.markAllAsRead = async function(userId, type = null) {
  const query = {
    recipientId: userId,
    'channels.inApp.enabled': true,
    'channels.inApp.delivered': true,
    'channels.inApp.read': false
  }
  
  if (type) {
    query.type = type
  }
  
  return await this.updateMany(query, {
    $set: {
      'channels.inApp.read': true,
      'channels.inApp.readAt': new Date()
    }
  })
}

NotificationSchema.statics.getNotificationStats = async function(userId) {
  const pipeline = [
    { $match: { recipientId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$channels.inApp.enabled', true] },
                  { $eq: ['$channels.inApp.delivered', true] },
                  { $eq: ['$channels.inApp.read', false] }
                ]
              },
              1,
              0
            ]
          }
        },
        byType: {
          $push: {
            type: '$type',
            read: '$channels.inApp.read'
          }
        }
      }
    }
  ]
  
  const result = await this.aggregate(pipeline)
  return result[0] || { total: 0, unread: 0, byType: [] }
}

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)