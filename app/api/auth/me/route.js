import { NextResponse } from 'next/server'
import { getCurrentUser, requireAuth, validatePassword, hashPassword } from '@/lib/auth'
import { sanitizeInput, isValidEmail, isValidZambianPhone } from '@/lib/utils'
import connectDB from '@/lib/db/connection'
import User from '@/lib/models/User'

// GET current user profile
export async function GET(request) {
  try {
    const authResult = await requireAuth()(request)
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult

    // Get fresh user data with additional fields
    await connectDB()
    const fullUser = await User.findById(user._id)
      .select('-password -emailVerificationToken -phoneVerificationCode -passwordResetToken')
      .populate('landlordId', 'firstName lastName businessInfo.businessName')

    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: fullUser._id,
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        fullName: fullUser.fullName,
        email: fullUser.email,
        phone: fullUser.phone,
        whatsappNumber: fullUser.whatsappNumber,
        role: fullUser.role,
        avatar: fullUser.avatar,
        address: fullUser.address,
        businessInfo: fullUser.businessInfo,
        bankDetails: fullUser.bankDetails,
        mobileMoneyAccounts: fullUser.mobileMoneyAccounts,
        notificationPreferences: fullUser.notificationPreferences,
        permissions: fullUser.permissions,
        landlord: fullUser.landlordId,
        isEmailVerified: fullUser.isEmailVerified,
        isPhoneVerified: fullUser.isPhoneVerified,
        lastLogin: fullUser.lastLogin,
        createdAt: fullUser.createdAt,
        updatedAt: fullUser.updatedAt
      }
    })

  } catch (error) {
    console.error('Get user profile error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

// PUT update user profile
export async function PUT(request) {
  try {
    const authResult = await requireAuth()(request)
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const body = await request.json()

    // Fields that can be updated
    const {
      firstName,
      lastName,
      phone,
      whatsappNumber,
      address,
      businessInfo,
      bankDetails,
      mobileMoneyAccounts,
      notificationPreferences,
      avatar
    } = body

    // Input validation
    const errors = []
    const updates = {}

    if (firstName !== undefined) {
      if (!firstName || firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long')
      } else {
        updates.firstName = sanitizeInput(firstName).trim()
      }
    }

    if (lastName !== undefined) {
      if (!lastName || lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long')
      } else {
        updates.lastName = sanitizeInput(lastName).trim()
      }
    }

    if (phone !== undefined) {
      if (!isValidZambianPhone(phone)) {
        errors.push('Please provide a valid Zambian phone number')
      } else {
        updates.phone = sanitizeInput(phone).trim()
      }
    }

    if (whatsappNumber !== undefined && whatsappNumber) {
      if (!isValidZambianPhone(whatsappNumber)) {
        errors.push('Please provide a valid WhatsApp number')
      } else {
        updates.whatsappNumber = sanitizeInput(whatsappNumber).trim()
      }
    }

    if (address !== undefined) {
      updates.address = {
        street: sanitizeInput(address.street || ''),
        area: sanitizeInput(address.area || ''),
        city: sanitizeInput(address.city || 'Lusaka'),
        province: address.province || 'Lusaka Province',
        postalCode: sanitizeInput(address.postalCode || '')
      }
    }

    if (businessInfo !== undefined && user.role === 'LANDLORD') {
      updates.businessInfo = {
        businessName: sanitizeInput(businessInfo.businessName || ''),
        businessRegistration: sanitizeInput(businessInfo.businessRegistration || ''),
        taxNumber: sanitizeInput(businessInfo.taxNumber || ''),
        businessPhone: sanitizeInput(businessInfo.businessPhone || ''),
        businessEmail: businessInfo.businessEmail ? 
          sanitizeInput(businessInfo.businessEmail).toLowerCase() : ''
      }

      // Validate business email if provided
      if (updates.businessInfo.businessEmail && !isValidEmail(updates.businessInfo.businessEmail)) {
        errors.push('Please provide a valid business email address')
      }
    }

    if (bankDetails !== undefined) {
      updates.bankDetails = {
        bankName: bankDetails.bankName || '',
        accountName: sanitizeInput(bankDetails.accountName || ''),
        accountNumber: sanitizeInput(bankDetails.accountNumber || ''),
        branchCode: sanitizeInput(bankDetails.branchCode || '')
      }
    }

    if (mobileMoneyAccounts !== undefined) {
      updates.mobileMoneyAccounts = mobileMoneyAccounts.map(account => ({
        provider: account.provider,
        phoneNumber: sanitizeInput(account.phoneNumber || ''),
        accountName: sanitizeInput(account.accountName || ''),
        isDefault: account.isDefault || false
      }))

      // Validate mobile money phone numbers
      for (const account of updates.mobileMoneyAccounts) {
        if (!isValidZambianPhone(account.phoneNumber)) {
          errors.push(`Invalid phone number for ${account.provider} account`)
        }
      }
    }

    if (notificationPreferences !== undefined) {
      updates.notificationPreferences = {
        email: Boolean(notificationPreferences.email),
        sms: Boolean(notificationPreferences.sms),
        whatsapp: Boolean(notificationPreferences.whatsapp),
        push: Boolean(notificationPreferences.push),
        paymentReminders: Boolean(notificationPreferences.paymentReminders),
        leaseExpiry: Boolean(notificationPreferences.leaseExpiry),
        maintenanceUpdates: Boolean(notificationPreferences.maintenanceUpdates),
        systemAnnouncements: Boolean(notificationPreferences.systemAnnouncements)
      }
    }

    if (avatar !== undefined) {
      updates.avatar = avatar
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Update user in database
    await connectDB()
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        ...updates,
        updatedBy: user._id,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password -emailVerificationToken -phoneVerificationCode -passwordResetToken')

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        whatsappNumber: updatedUser.whatsappNumber,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        address: updatedUser.address,
        businessInfo: updatedUser.businessInfo,
        bankDetails: updatedUser.bankDetails,
        mobileMoneyAccounts: updatedUser.mobileMoneyAccounts,
        notificationPreferences: updatedUser.notificationPreferences,
        permissions: updatedUser.permissions,
        isEmailVerified: updatedUser.isEmailVerified,
        isPhoneVerified: updatedUser.isPhoneVerified,
        lastLogin: updatedUser.lastLogin,
        updatedAt: updatedUser.updatedAt
      }
    })

  } catch (error) {
    console.error('Update user profile error:', error)
    
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}

// PATCH change password
export async function PATCH(request) {
  try {
    const authResult = await requireAuth()(request)
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { user } = authResult
    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Input validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Current password, new password, and confirmation are required' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match' },
        { status: 400 }
      )
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password validation failed', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Get user with password for verification
    await connectDB()
    const fullUser = await User.findById(user._id)

    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await fullUser.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password and update
    const hashedNewPassword = await hashPassword(newPassword)
    fullUser.password = hashedNewPassword
    fullUser.updatedBy = user._id
    await fullUser.save()

    return NextResponse.json({
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200 })
}