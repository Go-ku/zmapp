import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import connectDB from './connection.js'
import User from '../models/User.js'
import Property from '../models/Property.js'
import Lease from '../models/Lease.js'
import Payment from '../models/Payment.js'
import MaintenanceRequest from '../models/MaintenanceRequest.js'
import Notification from '../models/Notification.js'

// Zambian sample data
const zambianAreas = {
  'Lusaka Province': {
    'Lusaka': [
      'Kabulonga', 'Rhodes Park', 'Meanwood', 'Chelston', 'Avondale',
      'Woodlands', 'Ibex Hill', 'Roma', 'Kamwala', 'Matero',
      'Chilenje', 'Kalingalinga', 'Garden', 'PHI', 'Nyumba Yanga'
    ]
  },
  'Copperbelt Province': {
    'Kitwe': ['Riverside', 'Parklands', 'Buchi', 'Nkana East', 'Wusakile'],
    'Ndola': ['Kabushi', 'Northrise', 'Itawa', 'Masala', 'Kansenshi']
  },
  'Southern Province': {
    'Livingstone': ['Dambwa', 'Malota', 'Linda', 'Libuyu', 'Maramba']
  }
}

const zambianNames = {
  firstNames: [
    'Chanda', 'Mwila', 'Banda', 'Temba', 'Mulenga', 'Musonda', 'Sakala',
    'Kayombo', 'Chimuka', 'Chitalu', 'James', 'Mary', 'John', 'Grace',
    'Peter', 'Susan', 'David', 'Ruth', 'Joseph', 'Elizabeth', 'Daniel',
    'Margaret', 'Paul', 'Joyce', 'Samuel', 'Agnes', 'Moses', 'Esther'
  ],
  lastNames: [
    'Mwansa', 'Phiri', 'Banda', 'Mulenga', 'Siame', 'Tembo', 'Zulu',
    'Mumba', 'Chileshe', 'Ngoma', 'Mukuka', 'Lungu', 'Chama', 'Sichone',
    'Kalaba', 'Kabwe', 'Mwape', 'Simukonda', 'Chanda', 'Mbewe'
  ]
}

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateZambianPhone() {
  const networks = ['97', '95', '96', '76', '77']
  const network = getRandomElement(networks)
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0')
  return `+260 ${network} ${number.slice(0, 3)} ${number.slice(3)}`
}

function generatePropertyRef() {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `PROP${year}${random}`
}

function generateLeaseRef() {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `LEASE${year}${random}`
}

function generatePaymentRef() {
  const year = new Date().getFullYear()
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `PAY${year}${month}${random}`
}

function generateMaintenanceRef() {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `MAINT${year}${random}`
}

function getRandomDate(daysAgo, daysForward = 0) {
  const today = new Date()
  const pastDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
  const futureDate = new Date(today.getTime() + (daysForward * 24 * 60 * 60 * 1000))
  
  if (daysForward > 0) {
    const timeRange = futureDate.getTime() - pastDate.getTime()
    return new Date(pastDate.getTime() + Math.random() * timeRange)
  }
  
  return pastDate
}

// Seeder class
class DatabaseSeeder {
  constructor() {
    this.users = {
      systemAdmin: null,
      landlords: [],
      tenants: [],
      staff: []
    }
    this.properties = []
    this.leases = []
    this.payments = []
    this.maintenanceRequests = []
  }

  async seed() {
    try {
      console.log('🌱 Starting database seeding for Zambia Real Estate Management System...')
      
      // Connect to database
      await connectDB()
      
      // Clear existing data
      await this.clearDatabase()
      
      // Seed data in order
      await this.seedUsers()
      await this.seedProperties()
      await this.seedLeases()
      await this.seedPayments()
      await this.seedMaintenanceRequests()
      await this.seedNotifications()
      
      console.log('✅ Database seeding completed successfully!')
      console.log('\n📊 Summary:')
      console.log(`   👥 Users: ${Object.values(this.users).flat().length + 1}`)
      console.log(`   🏠 Properties: ${this.properties.length}`)
      console.log(`   📋 Leases: ${this.leases.length}`)
      console.log(`   💳 Payments: ${this.payments.length}`)
      console.log(`   🔧 Maintenance Requests: ${this.maintenanceRequests.length}`)
      console.log('\n🔑 Demo Login Credentials:')
      console.log('   System Admin: admin@zambiaproperties.com / Admin123!')
      console.log('   Landlord: landlord@zambiaproperties.com / Landlord123!')
      console.log('   Tenant: tenant@zambiaproperties.com / Tenant123!')
      console.log('   Staff: staff@zambiaproperties.com / Staff123!')
      
    } catch (error) {
      console.error('❌ Error seeding database:', error)
      throw error
    }
  }

  async clearDatabase() {
    console.log('🧹 Clearing existing data...')
    
    await Notification.deleteMany({})
    await MaintenanceRequest.deleteMany({})
    await Payment.deleteMany({})
    await Lease.deleteMany({})
    await Property.deleteMany({})
    await User.deleteMany({})
    
    console.log('✅ Database cleared')
  }

  async seedUsers() {
    console.log('👥 Seeding users...')
    
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    // System Administrator
    const adminData = {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@zambiaproperties.com',
      password: await bcrypt.hash('Admin123!', 12),
      phone: '+260 97 111 1111',
      role: 'SYSTEM_ADMIN',
      address: {
        street: 'Plot 15, Independence Avenue',
        area: 'Ridgeway',
        city: 'Lusaka',
        province: 'Lusaka Province',
        postalCode: '10101'
      },
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true
    }
    
    this.users.systemAdmin = await User.create(adminData)
    console.log('   ✅ System Administrator created')

    // Create Landlords
    const landlordData = [
      {
        firstName: 'Chanda',
        lastName: 'Mwansa',
        email: 'landlord@zambiaproperties.com',
        password: await bcrypt.hash('Landlord123!', 12),
        phone: '+260 97 222 2222',
        role: 'LANDLORD',
        businessInfo: {
          businessName: 'Mwansa Properties Ltd',
          businessRegistration: 'BIZ12345678',
          taxNumber: 'TAX987654321',
          businessPhone: '+260 97 222 2223',
          businessEmail: 'business@mwansaproperties.com'
        },
        address: {
          street: 'Plot 25, Cairo Road',
          area: 'Rhodes Park',
          city: 'Lusaka',
          province: 'Lusaka Province'
        },
        bankDetails: {
          bankName: 'Zanaco',
          accountName: 'Mwansa Properties Ltd',
          accountNumber: '1234567890',
          branchCode: '001'
        },
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true
      },
      {
        firstName: 'Grace',
        lastName: 'Tembo',
        email: 'grace.tembo@zambiaproperties.com',
        password: hashedPassword,
        phone: '+260 95 333 3333',
        role: 'LANDLORD',
        businessInfo: {
          businessName: 'Tembo Real Estate',
          businessRegistration: 'BIZ87654321',
          taxNumber: 'TAX123456789'
        },
        address: {
          street: 'Plot 45, Great East Road',
          area: 'Woodlands',
          city: 'Lusaka',
          province: 'Lusaka Province'
        },
        isActive: true,
        isEmailVerified: true
      }
    ]

    for (const data of landlordData) {
      const landlord = await User.create(data)
      this.users.landlords.push(landlord)
    }
    console.log(`   ✅ ${this.users.landlords.length} Landlords created`)

    // Create Tenants
    const tenantNames = [
      ['John', 'Banda'], ['Mary', 'Phiri'], ['James', 'Siame'],
      ['Ruth', 'Zulu'], ['David', 'Mumba'], ['Agnes', 'Chileshe'],
      ['Paul', 'Mukuka'], ['Joyce', 'Lungu'], ['Moses', 'Chama'],
      ['Esther', 'Kalaba']
    ]

    for (let i = 0; i < tenantNames.length; i++) {
      const [firstName, lastName] = tenantNames[i]
      const email = i === 0 ? 'tenant@zambiaproperties.com' : 
                   `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`
      const password = i === 0 ? await bcrypt.hash('Tenant123!', 12) : hashedPassword
      
      const province = getRandomElement(Object.keys(zambianAreas))
      const city = getRandomElement(Object.keys(zambianAreas[province]))
      const area = getRandomElement(zambianAreas[province][city])

      const tenantData = {
        firstName,
        lastName,
        email,
        password,
        phone: generateZambianPhone(),
        role: 'TENANT',
        address: {
          street: `Plot ${getRandomNumber(1, 999)}, ${getRandomElement(['Main', 'Church', 'School', 'Market'])} Road`,
          area,
          city,
          province
        },
        mobileMoneyAccounts: [{
          provider: getRandomElement(['MTN_MOBILE_MONEY', 'AIRTEL_MONEY', 'ZAMTEL_KWACHA']),
          phoneNumber: generateZambianPhone(),
          accountName: `${firstName} ${lastName}`,
          isDefault: true
        }],
        isActive: true,
        isEmailVerified: Math.random() > 0.3
      }

      const tenant = await User.create(tenantData)
      this.users.tenants.push(tenant)
    }
    console.log(`   ✅ ${this.users.tenants.length} Tenants created`)

    // Create Staff
    const staffData = {
      firstName: 'Peter',
      lastName: 'Mulenga',
      email: 'staff@zambiaproperties.com',
      password: await bcrypt.hash('Staff123!', 12),
      phone: '+260 96 444 4444',
      role: 'STAFF',
      landlordId: this.users.landlords[0]._id,
      permissions: {
        canLogPayments: true,
        canIssueReceipts: true,
        canViewTenants: true,
        canHandleMaintenance: true,
        canGenerateReports: false
      },
      address: {
        street: 'Plot 78, Kamwala Road',
        area: 'Kamwala',
        city: 'Lusaka',
        province: 'Lusaka Province'
      },
      isActive: true,
      isEmailVerified: true
    }

    const staff = await User.create(staffData)
    this.users.staff.push(staff)
    console.log('   ✅ Staff member created')
  }

  async seedProperties() {
    console.log('🏠 Seeding properties...')

    const propertyTypes = [
      { type: 'HOUSE', category: 'RESIDENTIAL', bedrooms: [2, 3, 4, 5], price: [15000, 35000] },
      { type: 'APARTMENT', category: 'RESIDENTIAL', bedrooms: [1, 2, 3], price: [8000, 25000] },
      { type: 'FLAT', category: 'RESIDENTIAL', bedrooms: [1, 2], price: [6000, 15000] },
      { type: 'OFFICE', category: 'COMMERCIAL', bedrooms: [0], price: [20000, 50000] },
      { type: 'SHOP', category: 'COMMERCIAL', bedrooms: [0], price: [10000, 30000] }
    ]

    for (const landlord of this.users.landlords) {
      const numProperties = getRandomNumber(3, 8)
      
      for (let i = 0; i < numProperties; i++) {
        const propertyType = getRandomElement(propertyTypes)
        const province = getRandomElement(Object.keys(zambianAreas))
        const city = getRandomElement(Object.keys(zambianAreas[province]))
        const area = getRandomElement(zambianAreas[province][city])
        
        const bedrooms = propertyType.bedrooms.length > 1 ? 
          getRandomElement(propertyType.bedrooms) : propertyType.bedrooms[0]
        
        const rentAmount = getRandomNumber(propertyType.price[0], propertyType.price[1])
        
        const propertyData = {
          title: `${bedrooms > 0 ? bedrooms + '-Bedroom' : 'Modern'} ${propertyType.type.toLowerCase()} in ${area}`,
          description: `Beautiful ${propertyType.type.toLowerCase()} located in the heart of ${area}, ${city}. ${
            propertyType.category === 'RESIDENTIAL' ? 
            'Perfect for families with modern amenities and secure environment.' :
            'Ideal for business operations with high foot traffic and excellent accessibility.'
          }`,
          propertyRef: generatePropertyRef(),
          type: propertyType.type,
          category: propertyType.category,
          bedrooms: bedrooms,
          bathrooms: propertyType.category === 'RESIDENTIAL' ? 
            Math.min(bedrooms, getRandomNumber(1, 3)) : getRandomNumber(1, 2),
          parking: getRandomNumber(1, 3),
          floorArea: getRandomNumber(80, 300),
          yearBuilt: getRandomNumber(2010, 2023),
          
          address: {
            street: `Plot ${getRandomNumber(1, 999)}, ${getRandomElement(['Independence', 'Cairo', 'Church', 'Great East', 'Nationalist'])} ${getRandomElement(['Road', 'Avenue', 'Street'])}`,
            area,
            city,
            province,
            coordinates: {
              latitude: -15.4067 + (Math.random() - 0.5) * 0.2,
              longitude: 28.2871 + (Math.random() - 0.5) * 0.2
            }
          },
          
          landlordId: landlord._id,
          managedBy: Math.random() > 0.5 ? landlord._id : this.users.staff[0]?._id,
          
          pricing: {
            rentAmount,
            currency: 'ZMW',
            deposit: rentAmount * getRandomNumber(1, 2),
            serviceCharge: Math.floor(rentAmount * 0.1),
            utilities: {
              water: { included: Math.random() > 0.5, cost: getRandomNumber(200, 500) },
              electricity: { included: Math.random() > 0.7, cost: getRandomNumber(300, 800) },
              internet: { included: Math.random() > 0.8, cost: 299 },
              security: { included: Math.random() > 0.6, cost: 500 },
              garbage: { included: Math.random() > 0.4, cost: 100 }
            }
          },
          
          features: {
            furnished: Math.random() > 0.6,
            airConditioning: Math.random() > 0.7,
            balcony: Math.random() > 0.5,
            garden: Math.random() > 0.6,
            security: Math.random() > 0.3,
            gatedCommunity: Math.random() > 0.5,
            petFriendly: Math.random() > 0.7
          },
          
          appliances: [
            { name: 'Refrigerator', condition: 'GOOD', included: true },
            { name: 'Stove', condition: 'EXCELLENT', included: true },
            { name: 'Water Heater', condition: 'GOOD', included: true }
          ],
          
          status: getRandomElement(['AVAILABLE', 'OCCUPIED', 'OCCUPIED', 'AVAILABLE']), // Higher chance of occupied
          
          availability: {
            availableFrom: new Date(),
            minimumLeaseTerm: 12,
            maximumLeaseTerm: 24
          },
          
          images: [{
            url: `https://images.unsplash.com/photo-${getRandomNumber(1500000000000, 1600000000000)}-${Math.random().toString(36).substr(2, 9)}?w=800&h=600&fit=crop`,
            caption: 'Main property view',
            isPrimary: true,
            uploadedAt: new Date()
          }],
          
          createdBy: landlord._id,
          isPublished: true,
          isArchived: false
        }

        const property = await Property.create(propertyData)
        this.properties.push(property)
      }
    }
    
    console.log(`   ✅ ${this.properties.length} Properties created`)
  }

  async seedLeases() {
    console.log('📋 Seeding leases...')

    // Get occupied properties
    const occupiedProperties = this.properties.filter(p => p.status === 'OCCUPIED')
    const availableTenants = [...this.users.tenants]

    for (let i = 0; i < Math.min(occupiedProperties.length, availableTenants.length); i++) {
      const property = occupiedProperties[i]
      const tenant = availableTenants[i]
      const landlord = this.users.landlords.find(l => l._id.toString() === property.landlordId.toString())

      const startDate = getRandomDate(365, 0)
      const endDate = new Date(startDate)
      endDate.setFullYear(endDate.getFullYear() + 1)

      const leaseData = {
        leaseRef: generateLeaseRef(),
        landlordId: landlord._id,
        tenantId: tenant._id,
        propertyId: property._id,
        
        startDate,
        endDate,
        duration: {
          months: 12,
          years: 1
        },
        
        rentDetails: {
          monthlyRent: property.pricing.rentAmount,
          currency: property.pricing.currency,
          deposit: {
            amount: property.pricing.deposit,
            depositPaid: true,
            depositPaidDate: new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
            refundable: true
          },
          serviceCharge: property.pricing.serviceCharge,
          utilitiesIncluded: {
            water: property.pricing.utilities.water.included,
            electricity: property.pricing.utilities.electricity.included,
            internet: property.pricing.utilities.internet.included,
            security: property.pricing.utilities.security.included,
            garbage: property.pricing.utilities.garbage.included
          }
        },
        
        paymentTerms: {
          dueDay: getRandomNumber(1, 28),
          gracePeriod: 5,
          lateFee: Math.floor(property.pricing.rentAmount * 0.05),
          lateFeeType: 'FLAT_RATE',
          preferredPaymentMethod: getRandomElement(['BANK_TRANSFER', 'MTN_MOBILE_MONEY', 'AIRTEL_MONEY'])
        },
        
        terms: {
          petPolicy: {
            allowed: property.features.petFriendly,
            deposit: property.features.petFriendly ? 2000 : 0,
            maxPets: property.features.petFriendly ? 2 : 0
          },
          smokingPolicy: { allowed: false },
          sublettingPolicy: { allowed: false, requiresApproval: true },
          alterationsPolicy: { allowed: false, requiresApproval: true }
        },
        
        status: 'ACTIVE',
        
        signatures: {
          landlord: {
            signed: true,
            signedDate: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
            signedBy: landlord._id
          },
          tenant: {
            signed: true,
            signedDate: new Date(startDate.getTime() - 5 * 24 * 60 * 60 * 1000),
            signedBy: tenant._id
          }
        },
        
        createdBy: landlord._id,
        approvedBy: landlord._id,
        approvedAt: new Date(startDate.getTime() - 10 * 24 * 60 * 60 * 1000)
      }

      const lease = await Lease.create(leaseData)
      this.leases.push(lease)
    }

    console.log(`   ✅ ${this.leases.length} Leases created`)
  }

  async seedPayments() {
    console.log('💳 Seeding payments...')

    for (const lease of this.leases) {
      const property = this.properties.find(p => p._id.toString() === lease.propertyId.toString())
      const landlord = this.users.landlords.find(l => l._id.toString() === lease.landlordId.toString())
      const tenant = this.users.tenants.find(t => t._id.toString() === lease.tenantId.toString())

      // Create 6 months of payments
      for (let month = 0; month < 6; month++) {
        const dueDate = new Date(lease.startDate)
        dueDate.setMonth(dueDate.getMonth() + month)
        dueDate.setDate(lease.paymentTerms.dueDay)

        const paymentStatuses = ['APPROVED', 'APPROVED', 'APPROVED', 'PENDING_APPROVAL', 'APPROVED']
        const status = month === 3 ? 'PENDING_APPROVAL' : getRandomElement(paymentStatuses)
        
        const isLate = Math.random() > 0.8
        const actualDate = isLate ? 
          new Date(dueDate.getTime() + getRandomNumber(1, 10) * 24 * 60 * 60 * 1000) :
          new Date(dueDate.getTime() - getRandomNumber(1, 5) * 24 * 60 * 60 * 1000)

        const paymentData = {
          paymentRef: generatePaymentRef(),
          tenantId: tenant._id,
          landlordId: landlord._id,
          propertyId: property._id,
          leaseId: lease._id,
          
          paymentType: 'MONTHLY_RENT',
          amount: lease.rentDetails.monthlyRent,
          currency: lease.rentDetails.currency,
          expectedAmount: lease.rentDetails.monthlyRent,
          
          paymentPeriod: {
            month: dueDate.getMonth() + 1,
            year: dueDate.getFullYear()
          },
          dueDate,
          
          paymentMethod: lease.paymentTerms.preferredPaymentMethod,
          
          transactionDetails: {
            transactionId: `TXN${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
            transactionDate: actualDate,
            mobileMoneyNumber: tenant.mobileMoneyAccounts[0]?.phoneNumber,
            confirmationCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
            notes: `Monthly rent payment for ${dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
          },
          
          status,
          
          approvalWorkflow: {
            requiredApprovers: [{
              approverId: landlord._id,
              role: 'LANDLORD',
              order: 1
            }],
            approvals: status === 'APPROVED' ? [{
              approverId: landlord._id,
              action: 'APPROVED',
              approvedAmount: lease.rentDetails.monthlyRent,
              comments: 'Payment verified and approved',
              approvedAt: new Date(actualDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours later
            }] : [],
            currentStep: status === 'APPROVED' ? 1 : 1,
            isComplete: status === 'APPROVED',
            completedAt: status === 'APPROVED' ? new Date(actualDate.getTime() + 2 * 60 * 60 * 1000) : null
          },
          
          verification: {
            isVerified: status === 'APPROVED',
            verifiedBy: status === 'APPROVED' ? landlord._id : null,
            verifiedAt: status === 'APPROVED' ? new Date(actualDate.getTime() + 60 * 60 * 1000) : null,
            verificationMethod: 'BANK_STATEMENT'
          },
          
          receipt: status === 'APPROVED' ? {
            receiptNumber: `RCP${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            issuedBy: landlord._id,
            issuedAt: new Date(actualDate.getTime() + 3 * 60 * 60 * 1000),
            sentToTenant: true,
            sentAt: new Date(actualDate.getTime() + 4 * 60 * 60 * 1000),
            sentVia: [
              { method: 'EMAIL', sentAt: new Date(), status: 'DELIVERED' },
              { method: 'WHATSAPP', sentAt: new Date(), status: 'DELIVERED' }
            ]
          } : {},
          
          latePayment: {
            isLate,
            daysLate: isLate ? getRandomNumber(1, 10) : 0,
            lateFeeApplied: isLate ? lease.paymentTerms.lateFee : 0,
            lateFeeWaived: false
          },
          
          attachments: [{
            name: 'payment_slip.jpg',
            type: 'MOBILE_MONEY_RECEIPT',
            url: `https://example.com/receipts/${Math.random().toString(36).substr(2, 10)}.jpg`,
            uploadedBy: tenant._id,
            uploadedAt: actualDate,
            fileSize: getRandomNumber(50000, 200000),
            mimeType: 'image/jpeg'
          }],
          
          createdBy: tenant._id,
          loggedBy: Math.random() > 0.5 ? tenant._id : this.users.staff[0]?._id
        }

        const payment = await Payment.create(paymentData)
        this.payments.push(payment)
      }
    }

    console.log(`   ✅ ${this.payments.length} Payments created`)
  }

  async seedMaintenanceRequests() {
    console.log('🔧 Seeding maintenance requests...')

    const categories = [
      { category: 'PLUMBING', titles: ['Leaking faucet', 'Blocked drain', 'Low water pressure', 'Toilet not flushing'] },
      { category: 'ELECTRICAL', titles: ['Power outlet not working', 'Light switch broken', 'Frequent power trips'] },
      { category: 'HVAC', titles: ['Air conditioning not cooling', 'Heater not working', 'Ventilation issues'] },
      { category: 'APPLIANCES', titles: ['Refrigerator not cooling', 'Stove burner not working', 'Water heater issues'] },
      { category: 'STRUCTURAL', titles: ['Cracked wall', 'Leaking roof', 'Loose tiles'] },
      { category: 'DOORS_WINDOWS', titles: ['Door lock broken', 'Window won\'t close', 'Broken window pane'] },
      { category: 'GARDEN_EXTERIOR', titles: ['Overgrown garden', 'Fence repair needed', 'Gate not working'] }
    ]

    const statuses = ['SUBMITTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED']
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

    for (const lease of this.leases) {
      const numRequests = getRandomNumber(1, 4)
      const property = this.properties.find(p => p._id.toString() === lease.propertyId.toString())
      const landlord = this.users.landlords.find(l => l._id.toString() === lease.landlordId.toString())
      const tenant = this.users.tenants.find(t => t._id.toString() === lease.tenantId.toString())

      for (let i = 0; i < numRequests; i++) {
        const categoryData = getRandomElement(categories)
        const title = getRandomElement(categoryData.titles)
        const priority = getRandomElement(priorities)
        const status = getRandomElement(statuses)
        const createdDate = getRandomDate(180, 0)

        const maintenanceData = {
          requestRef: generateMaintenanceRef(),
          tenantId: tenant._id,
          landlordId: landlord._id,
          propertyId: property._id,
          
          title,
          description: `${title} in the property. This needs immediate attention to ensure proper functioning of the property. ${
            priority === 'URGENT' ? 'This is an urgent matter that requires immediate response.' :
            priority === 'HIGH' ? 'This should be addressed as soon as possible.' :
            'Please schedule this maintenance at your earliest convenience.'
          }`,
          
          category: categoryData.category,
          priority,
          
          location: {
            room: getRandomElement(['LIVING_ROOM', 'KITCHEN', 'BEDROOM_1', 'BATHROOM_1', 'EXTERIOR']),
            specificLocation: 'As described in the request details'
          },
          
          status,
          
          urgencyAssessment: {
            isEmergency: priority === 'URGENT',
            safetyIssue: priority === 'URGENT' || Math.random() > 0.8,
            affectsHabitability: priority === 'HIGH' || priority === 'URGENT',
            causingPropertyDamage: Math.random() > 0.7,
            tenantAtFault: Math.random() > 0.9
          },
          
          assignment: status !== 'SUBMITTED' ? {
            assignedTo: this.users.staff[0]?._id || landlord._id,
            assignedBy: landlord._id,
            assignedAt: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000),
            contractor: {
              name: getRandomElement(['John Banda', 'Mary Mwila', 'James Phiri', 'Grace Tembo']),
              company: getRandomElement(['Lusaka Repairs Ltd', 'Quick Fix Services', 'Pro Maintenance Co']),
              phone: generateZambianPhone(),
              specialization: getRandomElement(['PLUMBER', 'ELECTRICIAN', 'GENERAL_HANDYMAN']),
              rating: getRandomNumber(3, 5)
            },
            estimatedStartDate: new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            estimatedCompletionDate: new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            actualStartDate: ['IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED'].includes(status) ? 
              new Date(createdDate.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
            actualCompletionDate: ['COMPLETED', 'VERIFIED', 'CLOSED'].includes(status) ? 
              new Date(createdDate.getTime() + 6 * 24 * 60 * 60 * 1000) : null
          } : {},
          
          costEstimate: {
            laborCost: getRandomNumber(500, 2000),
            materialsCost: getRandomNumber(200, 1000),
            totalEstimated: 0, // Will be calculated by pre-save middleware
            currency: 'ZMW',
            estimatedBy: landlord._id,
            estimatedAt: new Date(createdDate.getTime() + 24 * 60 * 60 * 1000)
          },
          
          actualCost: ['COMPLETED', 'VERIFIED', 'CLOSED'].includes(status) ? {
            laborCost: getRandomNumber(400, 1800),
            materialsCost: getRandomNumber(150, 900),
            totalActual: 0, // Will be calculated by pre-save middleware
            paidBy: 'LANDLORD'
          } : {},
          
          approval: {
            requiresApproval: true,
            approvedBy: status !== 'SUBMITTED' ? landlord._id : null,
            approvedAt: status !== 'SUBMITTED' ? new Date(createdDate.getTime() + 12 * 60 * 60 * 1000) : null,
            approvalComments: status !== 'SUBMITTED' ? 'Approved for maintenance work' : null
          },
          
          progressUpdates: [{
            updateBy: tenant._id,
            updateType: 'STATUS_CHANGE',
            message: 'Initial maintenance request submitted',
            timestamp: createdDate,
            isVisibleToTenant: true
          }],
          
          attachments: [{
            name: 'issue_photo.jpg',
            type: 'BEFORE_PHOTO',
            url: `https://example.com/maintenance/${Math.random().toString(36).substr(2, 10)}.jpg`,
            uploadedBy: tenant._id,
            uploadedAt: createdDate,
            fileSize: getRandomNumber(100000, 500000),
            mimeType: 'image/jpeg',
            description: 'Photo showing the maintenance issue'
          }],
          
          inspection: ['VERIFIED', 'CLOSED'].includes(status) ? {
            required: true,
            inspectedBy: landlord._id,
            inspectedAt: new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            qualityRating: getRandomNumber(3, 5),
            workmanshipRating: getRandomNumber(3, 5),
            timelinessRating: getRandomNumber(3, 5),
            inspectionNotes: 'Work completed satisfactorily',
            passed: true,
            reinspectionRequired: false
          } : {},
          
          tenantFeedback: status === 'CLOSED' ? {
            satisfactionRating: getRandomNumber(3, 5),
            responseTimeRating: getRandomNumber(3, 5),
            qualityRating: getRandomNumber(3, 5),
            communicationRating: getRandomNumber(3, 5),
            overallRating: getRandomNumber(3, 5),
            comments: 'The maintenance was handled professionally and efficiently.',
            wouldRecommend: true,
            feedbackDate: new Date(createdDate.getTime() + 8 * 24 * 60 * 60 * 1000)
          } : {},
          
          emergency: priority === 'URGENT' ? {
            isEmergency: true,
            emergencyType: getRandomElement(['WATER_LEAK', 'ELECTRICAL_HAZARD', 'STRUCTURAL_DAMAGE']),
            reportedAt: createdDate,
            respondedAt: new Date(createdDate.getTime() + 60 * 60 * 1000), // 1 hour response
            responseTime: 60
          } : {},
          
          createdBy: tenant._id
        }

        const maintenance = await MaintenanceRequest.create(maintenanceData)
        this.maintenanceRequests.push(maintenance)
      }
    }

    console.log(`   ✅ ${this.maintenanceRequests.length} Maintenance requests created`)
  }

  async seedNotifications() {
    console.log('🔔 Seeding notifications...')

    const notificationTypes = [
      'PAYMENT_REMINDER',
      'PAYMENT_RECEIVED',
      'PAYMENT_OVERDUE',
      'LEASE_EXPIRY',
      'MAINTENANCE_REQUEST',
      'MAINTENANCE_COMPLETED',
      'SYSTEM_ANNOUNCEMENT'
    ]

    // Create notifications for each user
    const allUsers = [
      this.users.systemAdmin,
      ...this.users.landlords,
      ...this.users.tenants,
      ...this.users.staff
    ]

    for (const user of allUsers) {
      const numNotifications = getRandomNumber(3, 8)
      
      for (let i = 0; i < numNotifications; i++) {
        const type = getRandomElement(notificationTypes)
        const isRead = Math.random() > 0.4 // 60% chance of being read
        const createdDate = getRandomDate(30, 0)

        const notificationData = {
          recipientId: user._id,
          senderId: type === 'SYSTEM_ANNOUNCEMENT' ? this.users.systemAdmin._id : 
                   user.role === 'TENANT' ? getRandomElement(this.users.landlords)._id :
                   getRandomElement(this.users.tenants)._id,
          
          title: this.getNotificationTitle(type, user.role),
          message: this.getNotificationMessage(type, user.role),
          shortMessage: this.getNotificationShortMessage(type),
          
          type,
          category: this.getNotificationCategory(type),
          priority: type.includes('OVERDUE') || type.includes('EMERGENCY') ? 'URGENT' : 
                   type.includes('REMINDER') ? 'HIGH' : 'MEDIUM',
          
          channels: {
            inApp: {
              enabled: true,
              delivered: true,
              deliveredAt: new Date(createdDate.getTime() + 5 * 60 * 1000),
              read: isRead,
              readAt: isRead ? new Date(createdDate.getTime() + getRandomNumber(60, 1440) * 60 * 1000) : null
            },
            email: {
              enabled: user.notificationPreferences?.email !== false,
              emailAddress: user.email,
              subject: this.getNotificationTitle(type, user.role),
              delivered: Math.random() > 0.1,
              deliveredAt: new Date(createdDate.getTime() + 10 * 60 * 1000),
              opened: Math.random() > 0.3,
              openedAt: Math.random() > 0.3 ? new Date(createdDate.getTime() + getRandomNumber(30, 720) * 60 * 1000) : null
            },
            whatsapp: {
              enabled: user.notificationPreferences?.whatsapp !== false && user.whatsappNumber,
              phoneNumber: user.whatsappNumber || user.phone,
              message: this.getNotificationMessage(type, user.role),
              delivered: user.whatsappNumber ? Math.random() > 0.05 : false,
              deliveredAt: user.whatsappNumber ? new Date(createdDate.getTime() + 15 * 60 * 1000) : null,
              read: user.whatsappNumber ? Math.random() > 0.2 : false,
              readAt: user.whatsappNumber && Math.random() > 0.2 ? 
                new Date(createdDate.getTime() + getRandomNumber(30, 480) * 60 * 1000) : null
            }
          },
          
          relatedObjects: {
            propertyId: this.properties.length > 0 ? getRandomElement(this.properties)._id : null,
            leaseId: this.leases.length > 0 ? getRandomElement(this.leases)._id : null,
            paymentId: this.payments.length > 0 && type.includes('PAYMENT') ? getRandomElement(this.payments)._id : null,
            maintenanceRequestId: this.maintenanceRequests.length > 0 && type.includes('MAINTENANCE') ? 
              getRandomElement(this.maintenanceRequests)._id : null
          },
          
          actionRequired: type.includes('REMINDER') || type.includes('OVERDUE'),
          actionUrl: this.getNotificationActionUrl(type, user.role),
          actionText: this.getNotificationActionText(type),
          
          scheduledFor: createdDate,
          status: 'DELIVERED',
          
          metadata: {
            source: 'SYSTEM',
            tags: [type.toLowerCase(), user.role.toLowerCase()]
          },
          
          createdBy: this.users.systemAdmin._id
        }

        await Notification.create(notificationData)
      }
    }

    console.log('   ✅ Notifications created for all users')
  }

  // Helper methods for notifications
  getNotificationTitle(type, userRole) {
    const titles = {
      PAYMENT_REMINDER: 'Payment Reminder',
      PAYMENT_RECEIVED: 'Payment Received',
      PAYMENT_OVERDUE: 'Overdue Payment Notice',
      LEASE_EXPIRY: 'Lease Expiring Soon',
      MAINTENANCE_REQUEST: userRole === 'LANDLORD' ? 'New Maintenance Request' : 'Maintenance Request Update',
      MAINTENANCE_COMPLETED: 'Maintenance Work Completed',
      SYSTEM_ANNOUNCEMENT: 'Important System Update'
    }
    return titles[type] || 'Notification'
  }

  getNotificationMessage(type, userRole) {
    const messages = {
      PAYMENT_REMINDER: 'Your monthly rent payment is due in 3 days. Please ensure timely payment to avoid late fees.',
      PAYMENT_RECEIVED: 'We have successfully received your payment. Thank you for your prompt payment.',
      PAYMENT_OVERDUE: 'Your rent payment is now overdue. Please make payment immediately to avoid additional charges.',
      LEASE_EXPIRY: 'Your lease agreement is expiring in 60 days. Please contact us to discuss renewal options.',
      MAINTENANCE_REQUEST: userRole === 'LANDLORD' ? 
        'A new maintenance request has been submitted for one of your properties. Please review and take appropriate action.' :
        'Your maintenance request has been received and is being processed. We will update you on the progress.',
      MAINTENANCE_COMPLETED: 'The maintenance work at your property has been completed. Please inspect and provide feedback.',
      SYSTEM_ANNOUNCEMENT: 'We have made important updates to improve your experience with our platform.'
    }
    return messages[type] || 'You have a new notification.'
  }

  getNotificationShortMessage(type) {
    const shortMessages = {
      PAYMENT_REMINDER: 'Payment due in 3 days',
      PAYMENT_RECEIVED: 'Payment received successfully',
      PAYMENT_OVERDUE: 'Payment overdue - action required',
      LEASE_EXPIRY: 'Lease expiring in 60 days',
      MAINTENANCE_REQUEST: 'New maintenance request',
      MAINTENANCE_COMPLETED: 'Maintenance work completed',
      SYSTEM_ANNOUNCEMENT: 'System update available'
    }
    return shortMessages[type] || 'New notification'
  }

  getNotificationCategory(type) {
    if (type.includes('PAYMENT')) return 'FINANCIAL'
    if (type.includes('MAINTENANCE')) return 'MAINTENANCE'
    if (type.includes('LEASE')) return 'LEGAL'
    return 'SYSTEM'
  }

  getNotificationActionUrl(type, userRole) {
    const baseUrl = userRole.toLowerCase() === 'system_admin' ? '/dashboard/admin' :
                   userRole.toLowerCase() === 'landlord' ? '/dashboard/landlord' :
                   userRole.toLowerCase() === 'tenant' ? '/dashboard/tenant' :
                   '/dashboard/staff'
    
    if (type.includes('PAYMENT')) return `${baseUrl}/payments`
    if (type.includes('MAINTENANCE')) return `${baseUrl}/maintenance`
    if (type.includes('LEASE')) return `${baseUrl}/leases`
    return baseUrl
  }

  getNotificationActionText(type) {
    if (type.includes('PAYMENT')) return 'View Payments'
    if (type.includes('MAINTENANCE')) return 'View Request'
    if (type.includes('LEASE')) return 'View Lease'
    return 'View Details'
  }
}

// Main execution
const seeder = new DatabaseSeeder()

async function runSeeder() {
  try {
    await seeder.seed()
    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

// Export for programmatic use
export default seeder

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeder()
}