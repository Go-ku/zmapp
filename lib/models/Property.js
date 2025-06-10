import { mongoose } from "../db/connection.js";

const PropertySchema = new mongoose.Schema(
  {
    // Basic Property Information
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Property description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    propertyRef: {
      type: String,
      unique: true,
      required: [true, "Property reference is required"],
      uppercase: true,
      match: [/^PROP\d{4}[A-Z0-9]{6}$/, "Invalid property reference format"],
    },

    // Property Type and Category
    type: {
      type: String,
      enum: [
        "HOUSE",
        "APARTMENT",
        "FLAT",
        "TOWNHOUSE",
        "OFFICE",
        "SHOP",
        "WAREHOUSE",
        "INDUSTRIAL",
        "LAND",
        "ROOM",
      ],
      required: [true, "Property type is required"],
    },
    category: {
      type: String,
      enum: ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "MIXED_USE"],
      required: [true, "Property category is required"],
    },

    // Property Specifications
    bedrooms: {
      type: Number,
      min: [0, "Bedrooms cannot be negative"],
      max: [20, "Bedrooms cannot exceed 20"],
    },
    bathrooms: {
      type: Number,
      min: [0, "Bathrooms cannot be negative"],
      max: [20, "Bathrooms cannot exceed 20"],
    },
    parking: {
      type: Number,
      min: [0, "Parking spaces cannot be negative"],
      default: 0,
    },
    floorArea: {
      type: Number, // in square meters
      min: [1, "Floor area must be at least 1 square meter"],
    },
    lotSize: {
      type: Number, // in square meters
      min: [1, "Lot size must be at least 1 square meter"],
    },
    floors: {
      type: Number,
      min: [1, "Must have at least 1 floor"],
      default: 1,
    },
    yearBuilt: {
      type: Number,
      min: [1900, "Year built must be 1900 or later"],
      max: [
        new Date().getFullYear() + 2,
        "Year built cannot be more than 2 years in the future",
      ],
    },

    // Location Information
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      area: {
        type: String,
        required: [true, "Area is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        default: "Lusaka",
      },
      province: {
        type: String,
        enum: [
          "Central Province",
          "Copperbelt Province",
          "Eastern Province",
          "Luapula Province",
          "Lusaka Province",
          "Muchinga Province",
          "Northern Province",
          "North-Western Province",
          "Southern Province",
          "Western Province",
        ],
        required: [true, "Province is required"],
        default: "Lusaka Province",
      },
      postalCode: {
        type: String,
        trim: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          min: [-90, "Latitude must be between -90 and 90"],
          max: [90, "Latitude must be between -90 and 90"],
        },
        longitude: {
          type: Number,
          min: [-180, "Longitude must be between -180 and 180"],
          max: [180, "Longitude must be between -180 and 180"],
        },
      },
    },

    // Ownership and Management
    landlordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Landlord is required"],
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Can be landlord or staff member
    },

    // Financial Information
    pricing: {
      rentAmount: {
        type: Number,
        required: [true, "Rent amount is required"],
        min: [0, "Rent amount cannot be negative"],
      },
      currency: {
        type: String,
        enum: ["ZMW", "USD"],
        default: "ZMW",
      },
      deposit: {
        type: Number,
        min: [0, "Deposit cannot be negative"],
        default: 0,
      },
      serviceCharge: {
        type: Number,
        min: [0, "Service charge cannot be negative"],
        default: 0,
      },
      utilities: {
        water: {
          included: { type: Boolean, default: false },
          cost: { type: Number, min: 0, default: 0 },
        },
        electricity: {
          included: { type: Boolean, default: false },
          cost: { type: Number, min: 0, default: 0 },
        },
        internet: {
          included: { type: Boolean, default: false },
          cost: { type: Number, min: 0, default: 0 },
        },
        security: {
          included: { type: Boolean, default: false },
          cost: { type: Number, min: 0, default: 0 },
        },
        garbage: {
          included: { type: Boolean, default: false },
          cost: { type: Number, min: 0, default: 0 },
        },
      },
    },

    // Property Features and Amenities
    features: {
      furnished: { type: Boolean, default: false },
      airConditioning: { type: Boolean, default: false },
      heating: { type: Boolean, default: false },
      balcony: { type: Boolean, default: false },
      garden: { type: Boolean, default: false },
      pool: { type: Boolean, default: false },
      gym: { type: Boolean, default: false },
      elevator: { type: Boolean, default: false },
      security: { type: Boolean, default: false },
      gatedCommunity: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      wheelchair: { type: Boolean, default: false },
    },

    // Appliances and Fittings
    appliances: [
      {
        name: {
          type: String,
          enum: [
            "Refrigerator",
            "Stove",
            "Oven",
            "Microwave",
            "Dishwasher",
            "Washing Machine",
            "Dryer",
            "Air Conditioner",
            "Water Heater",
            "TV",
            "Sound System",
            "Generator",
            "Solar Panels",
            "Borehole",
          ],
        },
        condition: {
          type: String,
          enum: ["NEW", "EXCELLENT", "GOOD", "FAIR", "POOR"],
          default: "GOOD",
        },
        included: { type: Boolean, default: true },
      },
    ],

    // Property Status
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "UNAVAILABLE"],
      default: "AVAILABLE",
    },
    availability: {
      availableFrom: {
        type: Date,
        default: Date.now,
      },
      minimumLeaseTerm: {
        type: Number, // in months
        min: [1, "Minimum lease term must be at least 1 month"],
        default: 12,
      },
      maximumLeaseTerm: {
        type: Number, // in months
        min: [1, "Maximum lease term must be at least 1 month"],
        default: 24,
      },
    },

    // Media and Documentation
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          trim: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    documents: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: [
            "TITLE_DEED",
            "SURVEY_REPORT",
            "VALUATION_REPORT",
            "INSPECTION_REPORT",
            "INSURANCE_POLICY",
            "ZESCO_CLEARANCE",
            "LWSC_CLEARANCE",
            "COUNCIL_RATES",
            "OTHER",
          ],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        expiryDate: Date,
      },
    ],

    // Lease Terms and Conditions
    leaseTerms: {
      defaultTerms: {
        type: String,
        trim: true,
        maxlength: [5000, "Lease terms cannot exceed 5000 characters"],
      },
      specialConditions: [
        {
          condition: {
            type: String,
            trim: true,
          },
          isNegotiable: {
            type: Boolean,
            default: true,
          },
        },
      ],
      restrictions: [
        {
          type: String,
          enum: [
            "NO_PETS",
            "NO_SMOKING",
            "NO_SUBLETTING",
            "NO_ALTERATIONS",
            "NO_LOUD_MUSIC",
            "NO_PARTIES",
            "BUSINESS_USE_PROHIBITED",
          ],
        },
      ],
    },

    // Inspection and Maintenance
    lastInspection: {
      date: Date,
      inspectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      report: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    maintenanceSchedule: [
      {
        type: {
          type: String,
          enum: [
            "MONTHLY_INSPECTION",
            "QUARTERLY_MAINTENANCE",
            "ANNUAL_SAFETY_CHECK",
            "GARDEN_MAINTENANCE",
            "HVAC_SERVICE",
            "PLUMBING_CHECK",
            "ELECTRICAL_CHECK",
          ],
        },
        frequency: {
          type: String,
          enum: ["WEEKLY", "MONTHLY", "QUARTERLY", "ANNUALLY"],
        },
        lastDone: Date,
        nextDue: Date,
        contractor: String,
      },
    ],

    // Insurance and Legal
    insurance: {
      provider: String,
      policyNumber: String,
      coverage: Number,
      premium: Number,
      startDate: Date,
      endDate: Date,
    },

    // Tax and Rates
    taxInfo: {
      propertyTax: {
        amount: { type: Number, min: 0, default: 0 },
        lastPaid: Date,
        nextDue: Date,
      },
      councilRates: {
        amount: { type: Number, min: 0, default: 0 },
        lastPaid: Date,
        nextDue: Date,
      },
    },

    // Performance Metrics
    metrics: {
      occupancyRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      averageRentDuration: {
        type: Number, // in months
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      maintenanceCosts: {
        type: Number,
        default: 0,
      },
    },

    // Visibility and Marketing
    isPublished: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },

    // Audit Trail
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
PropertySchema.index({ landlordId: 1, status: 1 });

PropertySchema.index({
  "address.province": 1,
  "address.city": 1,
  "address.area": 1,
});
PropertySchema.index({ type: 1, category: 1 });
PropertySchema.index({ "pricing.rentAmount": 1, "pricing.currency": 1 });
PropertySchema.index({ status: 1, isPublished: 1 });
PropertySchema.index({ createdAt: -1 });

// Geospatial index for location-based queries
PropertySchema.index({ "address.coordinates": "2dsphere" });

// Text index for search functionality
PropertySchema.index({
  title: "text",
  description: "text",
  "address.street": "text",
  "address.area": "text",
});

// Virtual for full address
PropertySchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  return `${addr.street}, ${addr.area}, ${addr.city}, ${addr.province}`;
});

// Virtual for current tenant
PropertySchema.virtual("currentTenant", {
  ref: "Lease",
  localField: "_id",
  foreignField: "propertyId",
  justOne: true,
  match: {
    status: "ACTIVE",
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  },
  populate: {
    path: "tenantId",
    select: "firstName lastName email phone",
  },
});

// Virtual for active lease
PropertySchema.virtual("activeLease", {
  ref: "Lease",
  localField: "_id",
  foreignField: "propertyId",
  justOne: true,
  match: {
    status: "ACTIVE",
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  },
});

// Virtual for total monthly cost (rent + utilities)
PropertySchema.virtual("totalMonthlyCost").get(function () {
  let total = this.pricing.rentAmount + this.pricing.serviceCharge;

  // Add utility costs if not included
  const utilities = this.pricing.utilities;
  if (!utilities.water.included) total += utilities.water.cost;
  if (!utilities.electricity.included) total += utilities.electricity.cost;
  if (!utilities.internet.included) total += utilities.internet.cost;
  if (!utilities.security.included) total += utilities.security.cost;
  if (!utilities.garbage.included) total += utilities.garbage.cost;

  return total;
});

// Pre-save middleware
PropertySchema.pre("save", function (next) {
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach((image, index) => {
      if (image.isPrimary) {
        primaryCount++;
        if (primaryCount > 1) {
          image.isPrimary = false;
        }
      }
    });

    // If no primary image, make the first one primary
    if (primaryCount === 0 && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }

  // Update coordinates if address changed
  if (this.isModified("address.street") || this.isModified("address.area")) {
    // Here you could integrate with a geocoding service
    // For now, we'll leave it as manual input
  }

  next();
});

// Instance methods
PropertySchema.methods.isAvailable = function () {
  return (
    this.status === "AVAILABLE" &&
    this.isPublished &&
    !this.isArchived &&
    new Date() >= this.availability.availableFrom
  );
};

PropertySchema.methods.isOccupied = function () {
  return this.status === "OCCUPIED";
};

PropertySchema.methods.getCurrentTenant = async function () {
  const Lease = mongoose.model("Lease");
  const lease = await Lease.findOne({
    propertyId: this._id,
    status: "ACTIVE",
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  }).populate("tenantId");

  return lease ? lease.tenantId : null;
};

PropertySchema.methods.getActiveLease = async function () {
  const Lease = mongoose.model("Lease");
  return await Lease.findOne({
    propertyId: this._id,
    status: "ACTIVE",
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });
};

PropertySchema.methods.calculateOccupancyRate = async function (year) {
  const Lease = mongoose.model("Lease");
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  const leases = await Lease.find({
    propertyId: this._id,
    $or: [
      { startDate: { $gte: startOfYear, $lte: endOfYear } },
      { endDate: { $gte: startOfYear, $lte: endOfYear } },
      {
        startDate: { $lte: startOfYear },
        endDate: { $gte: endOfYear },
      },
    ],
  });

  let occupiedDays = 0;
  leases.forEach((lease) => {
    const leaseStart =
      lease.startDate > startOfYear ? lease.startDate : startOfYear;
    const leaseEnd = lease.endDate < endOfYear ? lease.endDate : endOfYear;
    occupiedDays += (leaseEnd - leaseStart) / (1000 * 60 * 60 * 24);
  });

  const totalDays = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24);
  return Math.round((occupiedDays / totalDays) * 100);
};

PropertySchema.methods.updateStatus = async function (newStatus) {
  this.status = newStatus;
  this.updatedAt = new Date();
  return await this.save();
};

// Static methods
PropertySchema.statics.findByLandlord = function (landlordId, filters = {}) {
  return this.find({
    landlordId,
    isArchived: false,
    ...filters,
  }).sort({ createdAt: -1 });
};

PropertySchema.statics.findAvailable = function (filters = {}) {
  return this.find({
    status: "AVAILABLE",
    isPublished: true,
    isArchived: false,
    "availability.availableFrom": { $lte: new Date() },
    ...filters,
  }).sort({ createdAt: -1 });
};

PropertySchema.statics.searchProperties = function (query, filters = {}) {
  const searchCriteria = {
    $text: { $search: query },
    isPublished: true,
    isArchived: false,
    ...filters,
  };

  return this.find(searchCriteria, { score: { $meta: "textScore" } }).sort({
    score: { $meta: "textScore" },
  });
};

PropertySchema.statics.getSystemStats = async function (dateFilter) {
  const stats = await this.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        byType: [
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
              avgRent: { $avg: "$monthlyRent" }, // Added avg rent by type
            },
          },
        ],
        byLocation: [
          {
            $group: {
              _id: "$location",
              count: { $sum: 1 },
              avgRent: { $avg: "$monthlyRent" }, // Added avg rent by location
            },
          },
        ],
        averageRent: [
          {
            $group: {
              _id: null,
              avgRent: { $avg: "$monthlyRent" },
              minRent: { $min: "$monthlyRent" }, // Added min rent
              maxRent: { $max: "$monthlyRent" }, // Added max rent
            },
          },
        ],
        recentGrowth: [
          {
            $match: {
              createdAt: { $gte: dateFilter },
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);
  console.log(stats);
  const result = stats[0];

  // Convert status array to object with default values
  const statusCounts = Object.fromEntries(
    result.byStatus.map(({ _id, count }) => [_id, count])
  );

  return {
    total: result.total[0]?.count || 0,
    statusCounts, // Return the full status counts object
    byType: result.byType,
    byLocation: result.byLocation,
    rentStats: {
      // Consolidated rent statistics
      average: result.averageRent[0]?.avgRent || 0,
      min: result.averageRent[0]?.minRent || 0,
      max: result.averageRent[0]?.maxRent || 0,
    },
    metrics: {
      // Calculated metrics
      occupancyRate:
        ((statusCounts.occupied || 0) / (result.total[0]?.count || 1)) * 100,
      growthRate:
        ((result.recentGrowth[0]?.count || 0) / (result.total[0]?.count || 1)) *
        100,
    },
  };
};

PropertySchema.statics.getLandlordStats = async function (
  landlordId,
  dateFilter
) {
  const stats = await this.aggregate([
    [
      {
        $match: {
          landlordId: new mongoose.Types.ObjectId(landlordId),
        },
      },
      {
        $group: {
          _id: "$status",
          statusCount: { $sum: 1 },
          totalRent: { $sum: "$pricing.rentAmount" },
          propertiesCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalProperties: { $sum: "$propertiesCount" },
          statusCounts: {
            $push: {
              status: "$_id",
              count: "$statusCount",
            },
          },
          averageRent: { $avg: "$totalRent" },
        },
      },
      {
        $project: {
          _id: 0,
          totalProperties: 1,
          statusCounts: 1,
          averageRent: 1,
        },
      },
    ],
  ]);

  const result = stats[0];

  return {
    total: result.totalProperties,
    occupied: result.statusCounts[0].count,
    available: result.statusCounts[0].count,
    avgRent: result.averageRent
  };
};

PropertySchema.statics.getPropertyStats = async function (landlordId) {
  const pipeline = [
    { $match: { landlordId: mongoose.Types.ObjectId(landlordId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        available: {
          $sum: { $cond: [{ $eq: ["$status", "AVAILABLE"] }, 1, 0] },
        },
        occupied: {
          $sum: { $cond: [{ $eq: ["$status", "OCCUPIED"] }, 1, 0] },
        },
        maintenance: {
          $sum: { $cond: [{ $eq: ["$status", "MAINTENANCE"] }, 1, 0] },
        },
        averageRent: { $avg: "$pricing.rentAmount" },
        totalValue: { $sum: "$pricing.rentAmount" },
      },
    },
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

export default mongoose.models.Property ||
  mongoose.model("Property", PropertySchema);
